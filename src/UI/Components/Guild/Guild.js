/**
 * UI/Components/Guild/Guild.js
 *
 * Display pet informations
 *
 * This file is part of ROBrowser, Ragnarok Online in the Web Browser (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */
define(function (require) {
    'use strict';


    /**
	 * Dependencies
	 */
    var DB = require('DB/DBManager');
    var SkillInfo = require('DB/Skills/SkillInfo');
    var MonsterTable = require('DB/Monsters/MonsterTable');
    var ChatBox = require('UI/Components/ChatBox/ChatBox');
    var Client = require('Core/Client');
    var jQuery = require('Utils/jquery');
    var Preferences = require('Core/Preferences');
    var Renderer = require('Renderer/Renderer');
    var Session = require('Engine/SessionStorage');
    var UIManager = require('UI/UIManager');
    var UIComponent = require('UI/UIComponent');
    var htmlText = require('text!./Guild.html');
    var cssText = require('text!./Guild.css');
    var getModule = require;


    /**
	 * Create Component
	 */
    var Guild = new UIComponent('Guild', htmlText, cssText);


    /**
	 * Tab constant
	 */
    Guild.TAB = {
        GuildInfo: 0,
        GuildMemberInfo: 1,
        GuildPosInfo: 2,
        GuildSkill: 3,
        GuildBanish: 4,
        GuildNotice: 5
    };


    /**
	 * Store members
	 */
    Guild.Members = [];


    /**
	 * Store members
	 */
    Guild.Positions = [];


    /**
	 * Store skills
	 */
    Guild.Skills = [];


    /**
	 * @var {jQuery} level up button reference
	 */
    var _levelupBtn;


    /**
	 * @var {number} skill points
	 */
    var _skillPoints = 0;


    /**
	 * @var {number} tab
	 */
    var _tab = Guild.TAB.GuildInfo;


    /**
	 * @var {Preferences} Window preferences
	 */
    var _preferences = Preferences.get('Guild', {
        x: 100,
        y: 200
    }, 1.0);


    /**
	 * Initialize component
	 */
    Guild.init = function init() {
        var ui = this.ui;

        this.draggable();

        ui.find('.tabs button').mousedown(SwitchTab);
        ui.find('.modifyGuildNotice').mousedown(function (event) {
            Guild.reqSetGuildNotice(ui.find('.contentGuildNotice').find('.subject').val(), ui.find('.contentGuildNotice').find('.contentArea').val());
            event.stopImmediatePropagation();
        });

        // Get level up button
        _levelupBtn = this.ui.find('.btn.levelup').detach();
        _levelupBtn.click(function () {
            var index = this.parentNode.parentNode.getAttribute('data-index');
            SkillList.onIncreaseSkill(
				parseInt(index, 10)
			);
        });

        this.ui
			// background color
			.on('mousedown', '.selectable', function (event) {
			    var main = jQuery(this);

			    if (!main.hasClass('skill')) {
			        main = main.parent();
			    }

			    Guild.ui.find('.skill').removeClass('selected');
			    main.addClass('selected');

			    event.stopImmediatePropagation();
			})

        this.ui.find('.container .contentPositionInfo')
			// Scroll feature should block at each line
			.on('mousewheel DOMMouseScroll', onScroll)


        ui.find('.close').mousedown(function (event) {
            ui.hide();
            event.stopImmediatePropagation();
        });
    };


    /**
	 * Update scroll by block (32px)
	 */
    function onScroll(event) {
        var delta;

        if (event.originalEvent.wheelDelta) {
            delta = event.originalEvent.wheelDelta / 120;
            if (window.opera) {
                delta = -delta;
            }
        }
        else if (event.originalEvent.detail) {
            delta = -event.originalEvent.detail;
        }

        this.scrollTop = Math.floor(this.scrollTop / 32) * 32 - (delta * 32);
        return false;
    }


    /**
	 * Once append to body, remember of user configs
	 */
    Guild.onAppend = function onAppend() {
        this.ui.hide();

        this.ui.css({
            top: Math.min(Math.max(0, _preferences.y), Renderer.height - this.ui.height()),
            left: Math.min(Math.max(0, _preferences.x), Renderer.width - this.ui.width())
        });
    };


    /**
	 * Once remove from body, save user preferences
	 */
    Guild.onRemove = function onRemove() {
        // Save preferences
        _preferences.y = parseInt(this.ui.css('top'), 10);
        _preferences.x = parseInt(this.ui.css('left'), 10);
        _preferences.save();
    };


    /**
	 * Process shortcut
	 *
	 * @param {object} key
	 */
    Guild.onShortCut = function onShortCut(key) {
        if (Session.Guild == null || Session.Guild.GDID == 0) {
            return;
        }

        switch (key.cmd) {
            case 'TOGGLE':
                this.ui.toggle();

                // Fix zIndex
                if (this.ui.is(':visible')) {
                    Guild.reqGuildInfo(Guild.TAB.GuildInfo);
                    this.ui[0].parentNode.appendChild(this.ui[0]);
                }
                break;
        }
    };


    /**
	 * Update level of guild
	 *
	 * @param {int} guild level
	 */
    Guild.setLevel = function setLevel(level) {
        this.ui.find('.level').text(DB.getMessage(MsgStringIDs.MSI_GUILDLEVEL) + " : " + level);
    };

    /**
	 * Update name of guild
	 *
	 * @param {string} guild name
	 */
    Guild.setName = function setName(name) {
        if (this.ui != null) {
            this.ui.find('.name').text(DB.getMessage(MsgStringIDs.MSI_GUILDNAME) + " : " + name);
        }
    }

    /**
	 * Update information of guild
	 *
	 * @param {object} guild information
	 */
    Guild.setGuildInfo2 = function setGuildInfo2(pkt) {
        this.ui.find('.name').text(DB.getMessage(MsgStringIDs.MSI_GUILDNAME) + " : " + pkt.guildname);
        this.ui.find('.level').text(DB.getMessage(MsgStringIDs.MSI_GUILDLEVEL) + " : " + pkt.level);
        this.ui.find('.master').text(DB.getMessage(MsgStringIDs.MSI_GUILD_MASTER_NAME) + " : " + pkt.masterName);
        this.ui.find('.nummember').text(DB.getMessage(MsgStringIDs.MSI_GUILD_NUM_MEMBER) + " : " + pkt.userNum + " / " + pkt.maxUserNum);
        this.ui.find('.avglevel').text(DB.getMessage(MsgStringIDs.MSI_GUILD_AVG_MEMBER_LEVEL) + " : " + pkt.userAverageLevel);
        this.ui.find('.manageland').text(DB.getMessage(MsgStringIDs.MSI_GUILD_MANAGE_LAND) + " : " + pkt.manageLand);
        this.ui.find('.exp').text(DB.getMessage(MsgStringIDs.MSI_GUILD_EXP) + " : " + pkt.exp);

        this.ui.find('.bexp').show();
        this.ui.find('.bexp' + ' div').css('width', Math.min(100, Math.floor(pkt.exp * 100 / pkt.maxExp)) + '%');
        this.ui.find('.bexp' + '_value').text(Math.min(100, (Math.floor(pkt.exp * 1000 / pkt.maxExp) * 0.1).toFixed(1)) + '%');
    }

    Guild.setNotice = function SetNotice(pkt) {
        this.ui.find(".contentGuildNotice").find('.subject').val(pkt.subject);
        this.ui.find(".contentGuildNotice").find('.contentArea').text(pkt.notice);
    };

    Guild.setPositionNames = function SetPositionNames(pkt) {
        var i = 0;
        for (i = 0; i < pkt.memberList.length; i++) {
            this.Positions.push(pkt.memberList[i]);
        }
    };

    Guild.setPositionInfo = function SetPositionInfo(pkt) {
        var i = 0;
        var content = this.ui.find('.positionTable tbody');
        content.empty();
        var list = "";

        for (i = 0; i < pkt.memberInfo.length; i++) {
            list += '<tr>' +
                        '<td>' + pkt.memberInfo[i].positionID + '</td>' +
                        '<td>' + this.Positions[pkt.memberInfo[i].positionID].posName + '</td>' +
                        '<td><input type="checkbox" /></td>' +
                        '<td><input type="checkbox" /></td>' +
                        '<td>' + pkt.memberInfo[i].payRate + '</td>';

            //this.Positions.push(pkt.memberInfo[i]);
        }

        content.append(list);
    };

    Guild.setMembers = function SetMembers(pkt) {
        this.Members = pkt.memberInfo;
        this.rebuildMemberTable();
    };

    Guild.setBanishInfo = function SetBanishInfo(pkt) {
        var i = 0;
        var pos = 0;
        var content = this.ui.find('.banishTable tbody');
        content.empty();
        var list = "";

        for (i = 0; i < pkt.banList.length; i++) {
            list += '<tr>' +
					'<td>' + pkt.banList[i].charname + '</td>' +
					'<td>' + pkt.banList[i].reason + '</td>' +
				'</tr>';
        }

        content.append(list);
    };

    Guild.updateCharStat = function UpdateCharStat(pkt) {
        var i;
        var count;
        for (i = 0, count = this.Members.length; i < count; ++i) {
            if (this.Members[i].GID === pkt.GID) {
                ChatBox.addText(DB.getMessage(MsgStringIDs.MSI_GUILD_MEMBER_STATUS_OFFLINE + -pkt.status).replace('%s', this.Members[i].CharName), ChatBox.TYPE.BLUE);

                this.Members[i].CurrentState = pkt.status;
                this.Members[i].Sex = pkt.sex;
                this.Members[i].HeadType = pkt.head;
                this.Members[i].HeadPalette = pkt.headPalette;

                this.rebuildMemberTable();
                return;
            }
        }
    };

    Guild.getPositionByIndex = function getPositionByIndex(index) {
        var i, count;
        var list = Guild.Positions;

        for (i = 0, count = list.length; i < count; ++i) {
            if (list[i].positionID === index) {
                return list[i];
            }
        }

        return null;
    };


    /**
	 * Add skills to the list
	 */
    Guild.setSkills = function setSkills(pkt) {
        var i, count;

        if (this.ui == null) {
            this.append();
        }

        this._skillPoints = pkt.skillPoint;

        //for (i = 0, count = _list.length; i < count; ++i) {
        //    this.onUpdateSkill(_list[i].SKID, 0);
        //}

        this.Skills.length = 0;
        this.ui.find('.modifyGuildSkills table').empty();

        for (i = 0, count = pkt.skillList.length; i < count; ++i) {
            this.addSkill(pkt.skillList[i]);
        }
    };


    /**
	 * Insert skill to list
	 *
	 * @param {object} skill
	 */
    Guild.addSkill = function addSkill(skill) {


        // Custom skill ?
        if (!(skill.SKID in SkillInfo)) {
            return;
        }

        // Already in list, update it instead of duplicating it
        if (this.ui.find('.skill .id' + skill.SKID + ':first').length) {
            //this.updateSkill(skill);
            return;
        }

        var sk = SkillInfo[skill.SKID];
        var levelup = _levelupBtn.clone(true);
        var className = !skill.level ? 'disabled' : skill.type ? 'active' : 'passive';
        var element = jQuery(
			'<tr class="skill id' + skill.SKID + ' ' + className + ' selectable" data-index="' + skill.SKID + '" draggable="true">' +
				'<td class="icon"><img src="data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==" width="24" height="24" /></td>' +
				'<td class="levelupcontainer"></td>' +
				'<td>' +
					'<div class="name">' +
						sk.SkillName + '<br/>' +
						'<span class="level">' +
						(
							sk.bSeperateLv ? 'Lv : <span class="current">' + skill.level + '</span> / <span class="max">' + skill.level + '</span>'
							               : 'Lv : <span class="current">' + skill.level + '</span>'
						) +
						'</span>' +
					'</div>' +
				'</td>' +
			'</tr>'
		);

        if (!skill.upgradable || !this._skillPoints) {
            levelup.hide();
        }

        element.find('.levelupcontainer').append(levelup);
        this.ui.find('.modifyGuildSkills table').append(element);
        this.parseHTML.call(levelup);

        Client.loadFile(DB.INTERFACE_PATH + 'item/' + sk.Name + '.bmp', function (data) {
            element.find('.icon img').attr('src', data);
        });

        this.Skills.push(skill);
        //this.onUpdateSkill(skill.SKID, skill.level);
    };

    Guild.rebuildMemberTable = function rebuildMemberTable() {
        var i = 0;
        var total = 0;
        var pos = 0;
        var content = this.ui.find('.memberTable tbody');
        content.empty();
        var list = "";
        for (i = 0; i < this.Members.length; i++) {
            total += this.Members[i].MemberExp;
        }

        for (i = 0; i < this.Members.length; i++) {
            var member = this.Members[i];
            if (member.CurrentState == 1) {
                list += '<tr class="online">' +
                        '<td>' + member.CharName + '</td>' +
                        '<td><select>';
            } else {
                list += '<tr>' +
                        '<td>' + member.CharName + '</td>' +
                        '<td><select>';
            }
            for (pos = 0; pos < this.Positions.length; pos++) {
                list += '<option value="' + pos + '"' + (member.GPositionID === pos ? ' selected' : '') + '>' + this.Positions[pos].posName + '</option>';
            }
            list += '</select></td>' +
            '<td>' + MonsterTable[member.Job] + '</td>' +
            '<td>' + member.Level + '</td>' +
            '<!--<td>' + member.Memo + '</td>-->' +
            '<td>' + Math.round(100 / total * member.MemberExp) + "%" + '</td>' +
            '<td>' + member.MemberExp + '</td>' +
            '</tr>';
        }

        content.append(list);
    }

    /**
	 * Modify tab, filter display entries
	 */
    function SwitchTab(event) {
        var idx = jQuery(this).index();
        _preferences.tab = parseInt(idx, 10);
        Guild.reqGuildInfo(_preferences.tab);

        Guild.ui.find(".contentInfo").hide();
        Guild.ui.find(".contentMemberInfo").hide();
        Guild.ui.find(".contentGuildNotice").hide();
        Guild.ui.find(".contentPositionInfo").hide();
        Guild.ui.find(".modifyGuildSkills").hide();
        Guild.ui.find(".contentGuildBanish").hide();
        Guild.ui.find(".modifyGuildNotice").hide();

        switch (_preferences.tab) {
            case Guild.TAB.GuildInfo:
                Guild.ui.find(".contentInfo").show();
                break;

            case Guild.TAB.GuildMemberInfo:
                Guild.ui.find(".contentMemberInfo").show();
                break;

            case Guild.TAB.GuildPosInfo:
                Guild.ui.find(".contentPositionInfo").show();
                break;

            case Guild.TAB.GuildSkill:
                Guild.ui.find(".modifyGuildSkills").show();
                break;

            case Guild.TAB.GuildBanish:
                Guild.ui.find(".contentGuildBanish").show();
                break;

            case Guild.TAB.GuildNotice:
                Guild.ui.find(".contentGuildNotice").show();
                Guild.ui.find(".modifyGuildNotice").show();
                break;
        }

        event.stopImmediatePropagation();
        return false;
    }

    /**
	 * Functions defined in Engine/MapEngine/Guild.js
	 */
    Guild.reqGuildInfo = function reqGuildInfo() { };
    Guild.reqSetGuildNotice = function reqSetGuildNotice(/* subject, notice */) { };


    /**
	 * Create component and export it
	 */
    return UIManager.addComponent(Guild);
});