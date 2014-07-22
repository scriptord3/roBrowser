/**
 * DB/Skills/SkillUnit.js
 *
 * Zone effects
 *
 * This file is part of ROBrowser, Ragnarok Online in the Web Browser (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

define(['./SkillConst'], function (SK)
{
	'use strict';

	return {
		0x7e: SK.MG_SAFETYWALL,
		0x7f: SK.MG_FIREWALL,
		0x81: SK.AL_WARP,
		0x83: SK.PR_SANCTUARY,
		0x84: SK.PR_MAGNUS,
		0x85: SK.AL_PNEUMA,

		// DUMMY SKILL
		//0x86: AC_SHOWER MG_THUNDERSTORM WZ_HEAVENDRIVE, CR_GRANDCROSS, SG_SUN_WARM, SG_MOON_WARM GS_DESPERADO

		0x87: SK.WZ_FIREPILLAR,
		0x8d: SK.WZ_ICEWALL,
		0x8e: SK.WZ_QUAGMIRE,
		0x8f: SK.HT_BLASTMINE,

		0x90: SK.HT_SKIDTRAP,
		0x91: SK.HT_ANKLESNARE,
		0x92: SK.AS_VENOMDUST,
		0x93: SK.HT_LANDMINE,
		0x94: SK.HT_SHOCKWAVE,
		0x95: SK.HT_SANDMAN,
		0x96: SK.HT_FLASHER,
		0x97: SK.HT_FREEZINGTRAP,
		0x98: SK.HT_CLAYMORETRAP,
		0x99: SK.HT_TALKIEBOX,
		0x9a: SK.SA_VOLCANO,
		0x9b: SK.SA_DELUGE,
		0x9c: SK.SA_VIOLENTGALE,
		0x9d: SK.SA_LANDPROTECTOR,
		0x9e: SK.BD_LULLABY,
		0x9f: SK.BD_RICHMANKIM,

		0xa0: SK.BD_ETERNALCHAOS,
		0xa1: SK.BD_DRUMBATTLEFIELD,
		0xa2: SK.BD_RINGNIBELUNGEN,
		0xa3: SK.BD_ROKISWEIL,
		0xa4: SK.BD_INTOABYSS,
		0xa5: SK.BD_SIEGFRIED,
		0xa6: SK.BA_DISSONANCE,
		0xa7: SK.BA_WHISTLE,
		0xa8: SK.BA_ASSASSINCROSS,
		0xa9: SK.BA_POEMBRAGI,
		0xaa: SK.BA_APPLEIDUN,
		0xab: SK.DC_UGLYDANCE,
		0xac: SK.DC_HUMMING,
		0xad: SK.DC_DONTFORGETME,
		0xae: SK.DC_FORTUNEKISS,
		0xaf: SK.DC_SERVICEFORYOU,

		0xb0: SK.RG_GRAFFITI,
		0xb1: SK.AM_DEMONSTRATION,
		//0xb2: SK.WE_CALLPARTNER, WE_CALLBABY, WE_CALLPARENT
		0xb3: SK.PA_GOSPEL,
		0xb4: SK.HP_BASILICA,
		0xb5: SK.CG_MOONLIT,
		0xb6: SK.PF_FOGWALL,
		0xb7: SK.PF_SPIDERWEB,
		0xb8: SK.HW_GRAVITATION,
		0xb9: SK.CG_HERMODE,
		0xbb: SK.NJ_SUITON,
		0xbc: SK.NJ_TATAMIGAESHI,
		0xbd: SK.NJ_KAENSIN,
		0xbe: SK.GS_GROUNDDRIFT,

		0xc1: SK.GD_LEADERSHIP,
		0xc2: SK.GD_GLORYWOUNDS,
		0xc3: SK.GD_SOULCOLD,
		0xc4: SK.GD_HAWKEYES,
		0xc7: SK.NPC_EVILLAND,
		0xca: SK.AB_EPICLESIS,
		0xcb: SK.WL_EARTHSTRAIN,
		0xcc: SK.SC_MANHOLE,
		0xcd: SK.SC_DIMENSIONDOOR,
		0xce: SK.SC_CHAOSPANIC,
		0xcf: SK.SC_MAELSTROM,

		0xd0: SK.SC_BLOODYLUST,
		0xd1: SK.SC_FEINTBOMB,
		0xd2: SK.RA_MAGENTATRAP,
		0xd3: SK.RA_COBALTTRAP,
		0xd4: SK.RA_MAIZETRAP,
		0xd5: SK.RA_VERDURETRAP,
		0xd6: SK.RA_FIRINGTRAP,
		0xd7: SK.RA_ICEBOUNDTRAP,
		0xd8: SK.RA_ELECTRICSHOCKER,
		0xd9: SK.RA_CLUSTERBOMB,
		0xda: SK.WM_REVERBERATION,
		0xdb: SK.WM_SEVERE_RAINSTORM,
		0xdc: SK.SO_FIREWALK,
		0xdd: SK.SO_ELECTRICWALK,
		0xde: SK.WM_POEMOFNETHERWORLD,
		0xdf: SK.SO_PSYCHIC_WAVE,

		0xe0: SK.SO_CLOUD_KILL,
		0xe1: SK.GC_POISONSMOKE,
		0xe2: SK.NC_NEUTRALBARRIER,
		0xe3: SK.NC_STEALTHFIELD,
		0xe4: SK.SO_WARMER,
		0xe5: SK.GN_THORNS_TRAP,
		0xe6: SK.GN_WALLOFTHORN,
		0xe7: SK.GN_DEMONIC_FIRE,
		0xe8: SK.GN_FIRE_EXPANSION_SMOKE_POWDER,
		0xe9: SK.GN_FIRE_EXPANSION_TEAR_GAS,
		0xea: SK.GN_HELLS_PLANT,
		0xeb: SK.SO_VACUUM_EXTREME,
		0xec: SK.LG_BANDING,
		0xed: SK.EL_FIRE_MANTLE,
		0xee: SK.EL_WATER_BARRIER,
		0xef: SK.EL_ZEPHYR,

		0xf0: SK.EL_POWER_OF_GAIA,
		0xf1: SK.SO_FIRE_INSIGNIA,
		0xf2: SK.SO_WATER_INSIGNIA,
		0xf3: SK.SO_WIND_INSIGNIA,
		0xf4: SK.SO_EARTH_INSIGNIA,
		0xf5: SK.MH_POISON_MIST,
		0xf6: SK.MH_LAVA_SLIDE,
		0xf7: SK.MH_VOLCANIC_ASH,
		0xf8: SK.KO_ZENKAI,
		0xfc: SK.KO_MAKIBISHI,
		0xfd: SK.NPC_VENOMFOG,
		0xfe: SK.SC_SCAPE,

		0x101: SK.NC_MAGMA_ERUPTION,
		0x104: SK.RL_B_TRAP,
	};
});