/**
 * Loaders/GameFile.js
 *
 * Loaders for Gravity .grf file (Game RO File)
 *
 * This file is part of ROBrowser, Ragnarok Online in the Web Browser (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

define(['./GameFileDecrypt', 'Utils/BinaryReader', 'Utils/Struct', 'Utils/Inflate'],
function (GameFileDecrypt, BinaryReader, Struct, Inflate)
{
	'use strict';



	/**
	 * GRF Constructor
	 *
	 * @param {File} data
	 */
	function GRF(data)
	{
		if (data) {
			this.load(data);
		}
	}


	/**
	 * GRF Constants
	 */
	GRF.FILELIST_TYPE_FILE = 0x01; // entry is a file
	GRF.FILELIST_TYPE_ENCRYPT_MIXED = 0x02; // encryption mode 0 (header DES + periodic DES/shuffle)
	GRF.FILELIST_TYPE_ENCRYPT_HEADER = 0x04; // encryption mode 1 (header DES only)


	/**
	 * GRF Structures
	 */
	GRF.struct_header = new Struct(
		'unsigned char signature[15]',
		'unsigned char key[15]',
		'unsigned long file_table_offset',
		'unsigned long skip',
		'unsigned long filecount',
		'unsigned long version'
	);

	GRF.struct_table = new Struct(
		'unsigned long pack_size',
		'unsigned long real_size'
	);

	GRF.struct_entry = new Struct(
		'unsigned long pack_size',
		'unsigned long length_aligned',
		'unsigned long real_size',
		'unsigned char type',
		'unsigned long offset'
	);


	/**
	 * GRF METHODs
	 */
	GRF.prototype.file = null;
	GRF.prototype.reader = null;
	GRF.prototype.header = null;
	GRF.prototype.table = null;


	/**
	 * Loading GRF
	 *
	 * @param {File} file
	 */
	GRF.prototype.load = function Load(file)
	{
		// Global object
		this.file = file;
		this.reader = new FileReaderSync();


		// Local object
		var buffer, fp;
		var header;
		var table;
		var reader = this.reader;
		var data, out;
		var i, count;


		// Helper
		file.slice = file.slice || file.webkitSlice || file.mozSlice;
		reader.load = function (start, len)
		{
			return reader.readAsArrayBuffer(
				file.slice(start, start + len)
			);
		};


		// Check if file has enought content.
		if (file.size < GRF.struct_header.size) {
			throw new Error('GRF::load() - Not enough bytes to be a valid GRF');
		}


		// Read the header
		buffer = reader.load(0, GRF.struct_header.size);
		fp = new BinaryReader(buffer);
		header = fp.readStruct(GRF.struct_header);

		header.signature = String.fromCharCode.apply(null, header.signature);
		header.filecount -= header.skip + 7;


		// Check file header
		if (header.signature !== 'Master of Magic') {
			throw new Error('GRF::load() - Incorrect header "' + header.signature + '", must be "Master of Magic".');
		}

		if (header.version !== 0x200) {
			throw new Error('GRF::load() - Incorrect version "0x' + parseInt(header.version, 10).toString(16) + '", just support version "0x200"');
		}

		if (header.file_table_offset + GRF.struct_header.size > file.size || header.file_table_offset < 0) {
			throw new Error('GRF::load() - Can\'t jump to table list (' + header.file_table_offset + '), file length: ' + file.size);
		}

		// Load Table Info
		buffer = reader.load(header.file_table_offset + GRF.struct_header.size, GRF.struct_table.size);
		fp = new BinaryReader(buffer);
		table = fp.readStruct(GRF.struct_table);

		// Load Table Data
		buffer = reader.load(header.file_table_offset + GRF.struct_header.size + GRF.struct_table.size, table.pack_size);
		data = new Uint8Array(buffer);
		out = new Uint8Array(table.real_size);

		// Uncompress data
		(new Inflate(data)).getBytes(out);

		// Read all entries
		fp = new BinaryReader(out.buffer);
		table.fp = fp;
		table.data = '';

		for (i = 0, count = out.length; i < count; ++i) {
			table.data += String.fromCharCode(out[i]);
		}

		// Search in file isn't case sensitive...
		table.dataLowerCase = table.data.toLowerCase();

		this.table = table;
		this.header = header;
	};


	/**
	 * Decode entry to return its content
	 *
	 * @param {ArrayBuffer}
	 * @param {Entry}
	 * @param {function} callback
	 */
	GRF.prototype.decodeEntry = function DecodeEntry(buffer, entry, callback)
	{
		var out;
		var data = new Uint8Array(buffer);

		// Decode the file
		if (entry.type & GRF.FILELIST_TYPE_ENCRYPT_MIXED) {
			GameFileDecrypt.decodeFull(data, entry.length_aligned, entry.pack_size);
		}
		else if (entry.type & GRF.FILELIST_TYPE_ENCRYPT_HEADER) {
			GameFileDecrypt.decodeHeader(data, entry.length_aligned);
		}

		// Uncompress
		out = new Uint8Array(entry.real_size);
		(new Inflate(data)).getBytes(out);

		callback(out.buffer);
	};


	/**
	 * Find a file in the GRF
	 *
	 * @param {string} filename
	 * @param {function} callback
	 */
	GRF.prototype.getFile = function getFile(filename, callback)
	{
		// Not case sensitive...
		var path = filename.toLowerCase();
		var table = this.table.dataLowerCase;

		var fp = this.table.fp;
		var pos = table.indexOf(path + '\0');
		var entry, blob;
		var reader;

		// If filename is find in GRF table list
		if (pos !== -1) {

			// Skip filename, read file info
			fp.seek(pos + path.length + 1, SEEK_SET);
			entry = fp.readStruct(GRF.struct_entry);

			// Directory ?
			if (!(entry.type & GRF.FILELIST_TYPE_FILE)) {
				return false;
			}

			blob = this.file.slice(
				entry.offset + GRF.struct_header.size,
				entry.offset + GRF.struct_header.size + entry.length_aligned
			);

			// Load into memory
			if (self.FileReader) {
				var grf = this;

				reader = new FileReader();
				reader.onload = function ()
				{
					grf.decodeEntry(reader.result, entry, callback);
				};
				reader.readAsArrayBuffer(blob);
			}

				// Firefox doesn't seems to support FileReader in web worker
			else {
				reader = new FileReaderSync();
				this.decodeEntry(reader.readAsArrayBuffer(blob), entry, callback);
			}

			return true;
		}

		return false;
	};


	/**
	 * Export
	 */
	return GRF;
});