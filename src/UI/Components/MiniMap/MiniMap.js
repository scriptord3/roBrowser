/**
 * UI/Components/MiniMap.js
 *
 * MiniMap UI
 *
 * This file is part of ROBrowser, Ragnarok Online in the Web Browser (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */
define(function (require)
{
	'use strict';


	/**
	 * Dependencies
	 */
	var DB = require('DB/DBManager');
	var Client = require('Core/Client');
	var Preferences = require('Core/Preferences');
	var Session = require('Engine/SessionStorage');
	var Renderer = require('Renderer/Renderer');
	var Altitude = require('Renderer/Map/Altitude');
	var KEYS = require('Controls/KeyEventHandler');
	var UIManager = require('UI/UIManager');
	var UIComponent = require('UI/UIComponent');
	var htmlText = require('text!./MiniMap.html');
	var cssText = require('text!./MiniMap.css');


	/**
	 * Create MiniMap component
	 */
	var MiniMap = new UIComponent('MiniMap', htmlText, cssText);


	/**
	 * @var {Preferences}
	 */
	var _preferences = Preferences.get('MiniMap', {
		zoom: 1.0,
		opacity: 2
	});


	/**
	 * @var {Array} party members marker
	 */
	var _party = [];


	/**
	 * @var {Array} guild members marker
	 */
	var _guild = [];


	/**
	 * @var {Array} others markers
	 */
	var _markers = [];


	/**
	 * @var {Image} arrow image
	 */
	var _arrow = new Image();


	/**
	 * @var {Image} minimap image
	 */
	var _map = new Image();


	/**
	 * @var {CanvasRenderingContext2D} canvas context
	 */
	var _ctx;


	/**
	 * Initialize minimap
	 */
	MiniMap.init = function init()
	{
		function genericUpdateZoom(value)
		{
			return function ()
			{
				MiniMap.updateZoom(value);
			};
		}

		_ctx = this.ui.find('canvas')[0].getContext('2d');
		this.zoom = 0.0;
		this.opacity = 2;

		Client.loadFile(DB.INTERFACE_PATH + 'map/map_arrow.bmp', function (dataURI)
		{
			_arrow.src = dataURI;
		});

		// Bind DOM elements
		this.ui.find('.plus').mousedown(genericUpdateZoom(+1));
		this.ui.find('.minus').mousedown(genericUpdateZoom(-1));
	};


	/**
	 * Once append to HTML
	 */
	MiniMap.onAppend = function onAppend()
	{
		// Set preferences
		this.updateZoom(_preferences.zoom);
		this.toggleOpacity(_preferences.opacity + 1);

		Renderer.render(render);
	};


	/**
	 * Set map
	 *
	 * @param {string} mapname
	 */
	MiniMap.setMap = function setMap(mapname)
	{
		_map.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';

		var path = DB.INTERFACE_PATH.replace('data/texture/', '') + 'map/' + mapname.replace(/\..*/, '.bmp');
		path = path.replace(/\//g, '\\'); // normalize path separator
		path = DB.mapalias[path] || path;

		Client.loadFile('data/texture/' + path, function (dataURI)
		{
			_map.src = dataURI;
		});
	};


	/**
	 * KeyDown Handler
	 *
	 * @param {object} event
	 * @return {boolean}
	 */
	MiniMap.onKeyDown = function onKeyDown(event)
	{
		// Will not work on Chrome :(
		if (event.which === KEYS.TAB && KEYS.CTRL) {
			this.toggleOpacity();
			event.stopImmediatePropagation();
			return false;
		}

		return true;
	};


	/**
	 * Once removed from HTML
	 */
	MiniMap.onRemove = function onRemove()
	{
		// Clean up memory
		_party.length = 0;
		_guild.length = 0;
		_markers.length = 0;
	};


	/**
	 * Add a party mark to minimap
	 *
	 * @param {number} key account id
	 * @param {number} x position
	 * @param {number} y position
	 */
	MiniMap.addPartyMemberMark = function addPartyMember(key, x, y)
	{
		var i, count = _party.length;
		var r = Math.random;

		for (i = 0; i < count; ++i) {
			if (_party[i].key === key) {
				_party[i].x = x;
				_party[i].y = y;
				return;
			}
		}

		_party.push({
			key: key,
			x: x,
			y: y,
			color: 'rgb(' + [r() * 255 | 0, r() * 255 | 0, r() * 255 | 0] + ')'
		});
	};


	/**
	 * Remove a party mark from minimap
	 *
	 * @param {number} key account id
	 */
	MiniMap.removePartyMemberMark = function removePartyMemberMark(key)
	{
		var i, count = _party.length;

		for (i = 0; i < count; ++i) {
			if (_party[i].key === key) {
				_party.splice(i, 1);
				break;
			}
		}
	};


	/**
	 * Add a guild mark to minimap
	 *
	 * @param {number} key account id
	 * @param {number} x position
	 * @param {number} y position
	 */
	MiniMap.addGuildMemberMark = function addGuildMemberMark(key, x, y)
	{
		var i, count = _guild.length;

		for (i = 0; i < count; ++i) {
			if (_guild[i].key === key) {
				_guild[i].x = x;
				_guild[i].y = y;
				return;
			}
		}

		_guild.push({
			key: key,
			x: x,
			y: y
		});
	};


	/**
	 * Remove a guild mark from minimap
	 *
	 * @param {number} key account id
	 */
	MiniMap.removeGuildMemberMark = function removeGuildMemberMark(key)
	{
		var i, count = _guild.length;

		for (i = 0; i < count; ++i) {
			if (_guild[i].key === key) {
				_guild.splice(i, 1);
				break;
			}
		}
	};


	/**
	 * Add a npc mark to minimap
	 *
	 * @param {number} key id
	 * @param {number} x position
	 * @param {number} y position
	 * @param {Array} color
	 */
	MiniMap.addNpcMark = function addNPCMark(key, x, y, lcolor, time)
	{
		var i, count = _markers.length;
		var color = [
			(lcolor & 0x00ff0000) >> 16,
			(lcolor & 0x0000ff00) >> 8,
			(lcolor & 0x000000ff)
		];

		for (i = 0; i < count; ++i) {
			if (_markers[i].key === key) {
				_markers[i].x = x;
				_markers[i].y = y;
				_markers[i].color = 'rgb(' + color[0] + ',' + color[1] + ',' + color[2] + ')';
				_markers[i].tick = Renderer.tick + time;
				return;
			}
		}

		_markers.push({
			key: key,
			x: x,
			y: y,
			color: 'rgb(' + color[0] + ',' + color[1] + ',' + color[2] + ')',
			tick: Renderer.tick + time
		});
	};


	/**
	 * Remove a NPC mark from minimap
	 *
	 * @param {number} key id
	 */
	MiniMap.removeNpcMark = function removeNPCMark(key)
	{
		var i, count = _markers.length;

		for (i = 0; i < count; ++i) {
			if (_markers[i].key === key) {
				_markers.splice(i, 1);
				break;
			}
		}
	};


	/**
	 * Change zoom
	 * TODO: implement zoom feature in minimap.
	 */
	MiniMap.updateZoom = function updateZoom(value)
	{
		// _preferences.zoom = ...;
		// _preferences.save();
	};


	/**
	 * Change window opacity
	 */
	MiniMap.toggleOpacity = function toggleOpacity(opacity)
	{
		this.opacity = ((arguments.length ? opacity : this.opacity) + 2) % 3;
		_preferences.opacity = this.opacity;
		_preferences.save();

		switch (this.opacity) {
			case 0:
				this.ui.hide();
				break;

			case 1:
				_ctx.globalAlpha = 0.5;
				this.ui.show();
				break;

			case 2:
				_ctx.globalAlpha = 1.0;
				this.ui.show();
				break;
		}
	};


	/**
	 * Render GUI
	 */
	function render(tick)
	{
		var width = Altitude.width;
		var height = Altitude.height;
		var pos = Session.Entity.position;
		var max = Math.max(width, height);
		var f = 1 / max * 128;
		var start_x = (max - width) / 2 * f;
		var start_y = (height - max) / 2 * f;

		var i, count, dot;

		// Rendering map
		_ctx.clearRect(0, 0, 128, 128);

		if (_map.complete && _map.width) {
			_ctx.drawImage(_map, 0, 0, 128, 128);
		}

		// Render attached player arrow
		if (_arrow.complete && _arrow.width) {
			_ctx.save();
			_ctx.translate(start_x + pos[0] * f, start_y + 128 - pos[1] * f);
			_ctx.rotate((Session.Entity.direction + 4) * 45 * Math.PI / 180);
			_ctx.drawImage(_arrow, -_arrow.width * 0.5, -_arrow.height * 0.5);
			_ctx.restore();
		}

		// Render NPC mark
		if (tick % 1000 > 500) { // blink effect

			count = _markers.length;

			for (i = 0; i < count; ++i) {
				dot = _markers[i];

				// Auto remove feature
				if (dot.tick < Renderer.tick) {
					_markers.splice(i, 1);
					i--;
					count--;
					continue;
				}

				// Render mark
				_ctx.fillStyle = dot.color;
				_ctx.fillRect(start_x + dot.x * f - 1, start_y + 128 - dot.y * f - 4, 2, 8);
				_ctx.fillRect(start_x + dot.x * f - 4, start_y + 128 - dot.y * f - 1, 8, 2);
			}
		}

		// Render party members
		count = _party.length;
		for (i = 0; i < count; ++i) {
			dot = _party[i];
			_ctx.fillStyle = 'white';
			_ctx.fillRect(start_x + dot.x * f - 3, start_y + 128 - dot.y * f - 3, 6, 6);
			_ctx.fillStyle = dot.color;
			_ctx.fillRect(start_x + dot.x * f - 2, start_y + 128 - dot.y * f - 2, 4, 4);
		}

		// Render guild members
		count = _guild.length;

		if (count) {
			_ctx.fillStyle = 'rgb(0.9,0.7,0.8)';
			_ctx.strokeStyle = 'white';
			for (i = 0; i < count; ++i) {
				dot = _guild[i];
				_ctx.moveTo(start_x + dot.x * f + 0, start_y + 128 - dot.y * f - 3);
				_ctx.lineTo(start_x + dot.x * f + 3, start_y + 128 - dot.y * f + 3);
				_ctx.lineTo(start_x + dot.x * f - 3, start_y + 128 - dot.y * f + 3);
			}
			_ctx.stroke();
			_ctx.fill();
		}
	}


	/**
	 * Create component and return it
	 */
	return UIManager.addComponent(MiniMap);
});
