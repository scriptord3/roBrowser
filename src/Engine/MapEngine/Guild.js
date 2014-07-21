/**
 * Engine/MapEngine/Guild.js
 *
 * Manage guild
 *
 * This file is part of ROBrowser, Ragnarok Online in the Web Browser (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

define(function( require )
{
	'use strict';


	/**
	 * Load dependencies
	 */
	var DB = require('DB/DBManager');
	var Network       = require('Network/NetworkManager');
	var PACKET        = require('Network/PacketStructure');
	var ChatBox       = require('UI/Components/ChatBox/ChatBox');
	var MiniMap = require('UI/Components/MiniMap/MiniMap');
	var Guild = require('UI/Components/Guild/Guild');
	var Session = require('Engine/SessionStorage');
    
	/**
	 * Display entity life
	 *
	 * @param {object} pkt - PACKET.ZC.NOTIFY_HP_TO_GROUPM
	 */
	function onMemberTalk( pkt )
	{
		ChatBox.addText( pkt.msg, ChatBox.TYPE.GUILD );
	}


	/**
	 * Display guild member position
	 *
	 * @param {object} pkt - PACKET.ZC.NOTIFY_POSITION_TO_GUILDM
	 */
	function onMemberMove( pkt )
	{
		// Server remove mark with "-1" as position
		if (pkt.xPos < 0 || pkt.yPos < 0) {
			MiniMap.removeGuildMemberMark( pkt.AID );
		}
		else {
			MiniMap.addGuildMemberMark( pkt.AID, pkt.xPos, pkt.yPos );
		}
	}

	function onAckGuildMenuinterface(pkt) {
	    ChatBox.addText("onAckGuildMenuinterface", ChatBox.TYPE.GUILD);
	}
    
	function onMyGuildBasicInfo(pkt) {
	    ChatBox.addText("onMyGuildBasicInfo", ChatBox.TYPE.GUILD);
	}

	function onGuildInfo(pkt) {
	    ChatBox.addText("onGuildInfo", ChatBox.TYPE.GUILD);
	}

	function onGuildInfo2(pkt) {
	    Guild.setGuildInfo2(pkt);
	}

	function onPositionNameInfo(pkt) {
	    Guild.setPositionNames(pkt);
	}

	function onPositionInfo(pkt) {
	    Guild.setPositionInfo(pkt);
	}

	function onMemberInfo(pkt) {
	    Guild.setMembers(pkt);
	}

	function onBanishInfo(pkt) {
	    Guild.setBanishInfo(pkt);
	}

	function onUpdateCharStat(pkt) {
	    Guild.updateCharStat(pkt);
	}

	function onGuildSkills(pkt) {
	    Guild.setSkills(pkt);
	}

	function onGuildNotice(pkt) {
	    Guild.setNotice(pkt);
	    ChatBox.addText("[ " + pkt.subject + " ]", ChatBox.TYPE.INFO);
	    ChatBox.addText("[ " + pkt.notice + " ]", ChatBox.TYPE.INFO);
	}

	function onUpdateGDID(pkt) {
	    Session.Guild = {};
	    Session.Guild.GDID = pkt.GDID;
	    Session.Guild.emblemVersion = pkt.emblemVersion;
	    Session.Guild.right = pkt.right;
	    Session.Guild.isMaster = pkt.isMaster;
	    Session.Guild.isMaster = pkt.isMaster;
	    Session.Guild.InterSID = pkt.InterSID;
	    Session.Guild.GName = pkt.GName;

	    //Guild.prepare();
	    Guild.setName(Session.Guild.GName);
	}

	function onResultMakeGuild(pkt) {
	    switch (pkt.result)
	    {
	        case 0:
	            ChatBox.addText(DB.getMessage(MsgStringIDs.MSI_GUILD_MAKE_SUCCESS), ChatBox.TYPE.ERROR);
	            break;
	        case 1:
	            ChatBox.addText(DB.getMessage(MsgStringIDs.MSI_GUILD_MAKE_ALREADY_MEMBER), ChatBox.TYPE.ERROR);
	            break;
            case 2:
                ChatBox.addText(DB.getMessage(MsgStringIDs.MSI_GUILD_MAKE_GUILD_EXIST), ChatBox.TYPE.ERROR);
                break;
	        case 3:
	            ChatBox.addText(DB.getMessage(MsgStringIDs.MSI_GUILD_MAKE_GUILD_NONE_ITEM), ChatBox.TYPE.ERROR);
	            break;
	    }
	}
    
	Guild.reqGuildInfo = function reqGuildInfo(tab) {
	    var pkt = new PACKET.CZ.REQ_GUILD_MENU();
	    pkt.Type = tab;
	    Network.sendPacket(pkt);
	};

	Guild.reqSetGuildNotice = function reqSetGuildNotice(subject, notice) {
	    var pkt = new PACKET.CZ.GUILD_NOTICE();
	    pkt.GDID = Session.Guild.GDID;
	    pkt.subject = subject;
	    pkt.notice = notice;
	    Network.sendPacket(pkt);
	};

	/**
	 * Initialize
	 */
	return function EntityEngine()
	{
		Network.hookPacket(PACKET.ZC.UPDATE_GDID, onUpdateGDID);
		Network.hookPacket(PACKET.ZC.RESULT_MAKE_GUILD, onResultMakeGuild);
		Network.hookPacket(PACKET.ZC.ACK_GUILD_MENUINTERFACE, onAckGuildMenuinterface);
		Network.hookPacket(PACKET.ZC.MYGUILD_BASIC_INFO, onMyGuildBasicInfo);
		Network.hookPacket(PACKET.ZC.GUILD_INFO, onGuildInfo);
		Network.hookPacket(PACKET.ZC.GUILD_INFO2, onGuildInfo2);
		Network.hookPacket(PACKET.ZC.GUILD_CHAT,                onMemberTalk );
		Network.hookPacket(PACKET.ZC.NOTIFY_POSITION_TO_GUILDM, onMemberMove);
		Network.hookPacket(PACKET.ZC.POSITION_ID_NAME_INFO, onPositionNameInfo);
		Network.hookPacket(PACKET.ZC.POSITION_INFO, onPositionInfo);
		Network.hookPacket(PACKET.ZC.MEMBERMGR_INFO, onMemberInfo);
		Network.hookPacket(PACKET.ZC.BAN_LIST, onBanishInfo);
		Network.hookPacket(PACKET.ZC.GUILD_NOTICE, onGuildNotice);
		Network.hookPacket(PACKET.ZC.GUILD_SKILLINFO, onGuildSkills);
		Network.hookPacket(PACKET.ZC.UPDATE_CHARSTAT2, onUpdateCharStat);
	};
});