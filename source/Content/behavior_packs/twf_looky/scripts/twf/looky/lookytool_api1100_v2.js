import * as mc from "@minecraft/server";
import * as mcui from "@minecraft/server-ui"
// import { multiButtonScriptDialogue } from './MinecraftScriptDialogue';
// import { FormRejectError, FormCancelationReason, MessageFormData, ActionFormData, ModalFormData } from '@minecraft/server-ui';

// @TheWorldFoundry
// 2024-05-25: Full rewrite and expand Entity handling.
// 2024-05-30: allow the player to turn particles on/off and sound on/off
// 2024-05-31: Bamboo for panda / removed word saint from info credits
// 2024-06-21: Purge unused tools


mc.world.sendMessage("LOOKY TOOL by @TheWorldFoundry is enabled.");

const LT_GUIDE_PAGE_SETTING = 'lookytool_setting_guidepage'

// ******************* Guidebook and forms handling

const show_form_on_item_use = ({ itemTypeId, soundOnOpen, soundOnClose }) => {
    mc.world.afterEvents.itemUse.subscribe(async (event) => {
		const { source: player, itemStack } = event;
		if (itemStack.typeId === itemTypeId) {
            guide_book_master_harness(player, soundOnOpen, soundOnClose);
        };
    });
};


// ******************* forms instances
const guide_form_menu = new mcui.ActionFormData()
        .title({translate: "twf_looky:guide.name"})
        .body(
			{
				rawtext: [
				  {translate: "twf_looky:guide_info.part_01",with: ["\n"]}, 
				  {text: "§r\n\n",}
				],
			}		
		)
		.button({ translate: "twf_looky:guide_button_craft" }, 'textures/blocks/crafting_table_top')
		.button({ translate: "twf_looky:guide_button_use" }, 'textures/twf/looky/items/guide_tex.png')
		.button({ translate: "twf_looky:guide_button_settings" }, 'textures/blocks/command_block')
		.button( { translate: "twf_looky:guide_exit" }, undefined);

const guide_form_craft = new mcui.ActionFormData()
        .title({translate: "twf_looky:guide.name"})
        .body(
			{
				rawtext: [
				  {translate: "twf_looky:guide_info.part_10",with: ["\n"]}, 
				  {text: "§r\n\n",}
				],
			}		
		)
		.button( { translate: "twf_looky:guide_page_close" }, undefined);

const guide_form_info = new mcui.ActionFormData()
        .title({translate: "twf_looky:guide.name"})
        .body(
			{
				rawtext: [
				  {translate: "twf_looky:guide_info.part_02",with: ["\n"]}, 
				  {text: "§r\n\n",},
				  {translate: "twf_looky:guide_info.part_03",with: ["\n"]}, 
				  {text: "§r\n\n",},
				  {translate: "twf_looky:guide_info.part_04",with: ["\n"]}, 
				  {text: "§r\n\n",},
				  {translate: "twf_looky:guide_info.part_05",with: ["\n"]}, 
				  {text: "§r\n\n",},
				  {translate: "twf_looky:guide_info.part_06",with: ["\n"]}, 
				  {text: "§r\n\n",},
				  {translate: "twf_looky:guide_info.part_07",with: ["\n"]}, 
				  {text: "§r\n\n",},
				  {translate: "twf_looky:guide_info.part_08",with: ["\n"]}, 
				  {text: "§r\n\n",},
				  {translate: "twf_looky:guide_info.part_09",with: ["\n"]}, 
				  {text: "§r\n\n",}
				],
			}		
		)
		.button( { translate: "twf_looky:guide_page_close" }, undefined);

// ******************* Guidebook master loop

const LT_SOUNDS_SETTING = 'lookytool_setting_sounds'
const LT_PARTICLES_SETTING = 'lookytool_setting_particles'
const LT_DEFAULT_TOOL_SETTING = 'lookytool_setting_default_tool'

const guide_forms = {
	"0": { guide_form_menu },
	"1": { guide_form_craft },
	"2": { guide_form_info },
	"3": { } // Settings
}

function guide_settings_form_show(player) {
	let sounds = true;
	let particles = true;
	let grass_tool = 1;

	if(player.getDynamicProperty(LT_SOUNDS_SETTING) === undefined) {
		player.setDynamicProperty(LT_SOUNDS_SETTING, 1);
	}
	if(player.getDynamicProperty(LT_SOUNDS_SETTING) === 1) {
		sounds = true;
	} else {
		sounds = false;
	}

	if(player.getDynamicProperty(LT_PARTICLES_SETTING) === undefined) {
		player.setDynamicProperty(LT_PARTICLES_SETTING, 1);
	}
	if(player.getDynamicProperty(LT_PARTICLES_SETTING) === 1) {
		particles = true;
	} else {
		particles = false;
	}

	if(player.getDynamicProperty(LT_DEFAULT_TOOL_SETTING) === undefined) {
		player.setDynamicProperty(LT_DEFAULT_TOOL_SETTING, 1);
	}
	if(player.getDynamicProperty(LT_DEFAULT_TOOL_SETTING) === 1) {
		grass_tool = 1;
	} else {
		grass_tool = 0;
	}
				
	const guide_form_settings = new mcui.ModalFormData().title({translate: "twf_looky:guide.name"});
	guide_form_settings.toggle('Particles', particles);
	guide_form_settings.toggle('Tool change sound', sounds);
	guide_form_settings.dropdown('Grass/Dirt tool', ['Hoe', 'Shovel'], grass_tool);

	guide_form_settings.show(player).then((formData) => {
		if(formData.cancelled) {

		}
		else {
			if( formData.formValues[0] === true ) {
				player.setDynamicProperty(LT_PARTICLES_SETTING, 1);
			} else {
				player.setDynamicProperty(LT_PARTICLES_SETTING, 0);
			}

			if( formData.formValues[1] === true ) {
				player.setDynamicProperty(LT_SOUNDS_SETTING, 1);
			} else {
				player.setDynamicProperty(LT_SOUNDS_SETTING, 0);
			}

			player.setDynamicProperty(LT_DEFAULT_TOOL_SETTING, formData.formValues[2]);
			

		}
	}).catch((error) => {
	});

	guide_form_menu.show(player).then((response) => guide_form_menu_handler(response, player));
}

function guide_form_menu_handler(response, player) {
	if(response.cancelled || response.selection === undefined) {
	}
	else if (response.selection === 0) { // Craft
		guide_form_craft.show(player).then((response2) => {
			if(response2.cancelled) {
			}
			guide_form_menu.show(player).then((response) => guide_form_menu_handler(response, player));
		}).catch((error) => {
		});
	}
	else if (response.selection === 1) { // Info		
		guide_form_info.show(player).then((response2) => {
			if(response2.cancelled || response2.selection === undefined) {
			}
			guide_form_menu.show(player).then((response) => guide_form_menu_handler(response, player));
		}).catch((error) => {
		});

	}		
	else if (response.selection === 2) { // Settings
		let sounds = true;
		let particles = true;
		let grass_tool = 1;

		if(player.getDynamicProperty(LT_SOUNDS_SETTING) === undefined) {
			player.setDynamicProperty(LT_SOUNDS_SETTING, 1);
		}
		if(player.getDynamicProperty(LT_SOUNDS_SETTING) === 1) {
			sounds = true;
		} else {
			sounds = false;
		}

		if(player.getDynamicProperty(LT_PARTICLES_SETTING) === undefined) {
			player.setDynamicProperty(LT_PARTICLES_SETTING, 1);
		}
		if(player.getDynamicProperty(LT_PARTICLES_SETTING) === 1) {
			particles = true;
		} else {
			particles = false;
		}

		if(player.getDynamicProperty(LT_DEFAULT_TOOL_SETTING) === undefined) {
			player.setDynamicProperty(LT_DEFAULT_TOOL_SETTING, 1);
		}
		if(player.getDynamicProperty(LT_DEFAULT_TOOL_SETTING) === 1) {
			grass_tool = 1;
		} else {
			grass_tool = 0;
		}
					
		const guide_form_settings = new mcui.ModalFormData().title({translate: "twf_looky:guide.name"});
		guide_form_settings.toggle('Particles', particles);
		guide_form_settings.toggle('Tool change sound', sounds);
		guide_form_settings.dropdown('Grass/Dirt tool', ['Hoe', 'Shovel'], grass_tool);

		guide_form_settings.show(player).then((formData) => {
			if(formData.cancelled) {

			}
			else {
				if( formData.formValues[0] === true ) {
					player.setDynamicProperty(LT_PARTICLES_SETTING, 1);
				} else {
					player.setDynamicProperty(LT_PARTICLES_SETTING, 0);
				}

				if( formData.formValues[1] === true ) {
					player.setDynamicProperty(LT_SOUNDS_SETTING, 1);
				} else {
					player.setDynamicProperty(LT_SOUNDS_SETTING, 0);
				}

				player.setDynamicProperty(LT_DEFAULT_TOOL_SETTING, formData.formValues[2]);
				

			}
			guide_form_menu.show(player).then((response) => guide_form_menu_handler(response, player));
		}).catch((error) => {
		});
	}		
	else if (response.selection === 3) {
	}
}

function read_guide_entry(player) {
	let current_form = player.getDynamicProperty(LT_GUIDE_PAGE_SETTING);
	if(current_form == undefined ) {
		current_form = 0; // Main form default
	}
	
	// Show the current form, with special handling for modal forms
	guide_form_menu.show(player).then((response) => guide_form_menu_handler(response, player));
	
	player.setDynamicProperty(LT_GUIDE_PAGE_SETTING, current_form)
}


function read_guide_recursion(player) {
	guide_form_menu.show(player).then((response) => {
		if(response.cancelled || response.selection === undefined) {
		}
		else if (response.selection === 0) { // Craft
			guide_form_craft.show(player).then((response2) => {
				if(response2.cancelled) {
				}
				read_guide(player);
			}).catch((error) => {
			});
		}
		else if (response.selection === 1) { // Info		
			guide_form_info.show(player).then((response2) => {
				if(response2.cancelled || response2.selection === undefined) {
				}
				read_guide(player);
			}).catch((error) => {
			});

		}		
		else if (response.selection === 2) { // Settings
			let sounds = true;
			let particles = true;
			let grass_tool = 1;

			if(player.getDynamicProperty(LT_SOUNDS_SETTING) === undefined) {
				player.setDynamicProperty(LT_SOUNDS_SETTING, 1);
			}
			if(player.getDynamicProperty(LT_SOUNDS_SETTING) === 1) {
				sounds = true;
			} else {
				sounds = false;
			}

			if(player.getDynamicProperty(LT_PARTICLES_SETTING) === undefined) {
				player.setDynamicProperty(LT_PARTICLES_SETTING, 1);
			}
			if(player.getDynamicProperty(LT_PARTICLES_SETTING) === 1) {
				particles = true;
			} else {
				particles = false;
			}

			if(player.getDynamicProperty(LT_DEFAULT_TOOL_SETTING) === undefined) {
				player.setDynamicProperty(LT_DEFAULT_TOOL_SETTING, 1);
			}
			if(player.getDynamicProperty(LT_DEFAULT_TOOL_SETTING) === 1) {
				grass_tool = 1;
			} else {
				grass_tool = 0;
			}
						
			const guide_form_settings = new mcui.ModalFormData().title({translate: "twf_looky:guide.name"});
			guide_form_settings.toggle('Particles', particles);
			guide_form_settings.toggle('Tool change sound', sounds);
			guide_form_settings.dropdown('Grass/Dirt tool', ['Hoe', 'Shovel'], grass_tool);

			guide_form_settings.show(player).then((formData) => {
				if(formData.cancelled) {

				}
				else {
					if( formData.formValues[0] === true ) {
						player.setDynamicProperty(LT_PARTICLES_SETTING, 1);
					} else {
						player.setDynamicProperty(LT_PARTICLES_SETTING, 0);
					}

					if( formData.formValues[1] === true ) {
						player.setDynamicProperty(LT_SOUNDS_SETTING, 1);
					} else {
						player.setDynamicProperty(LT_SOUNDS_SETTING, 0);
					}

					player.setDynamicProperty(LT_DEFAULT_TOOL_SETTING, formData.formValues[2]);
					

				}
				read_guide(player);
			}).catch((error) => {
			});
		}		
		else if (response.selection === 3) {
		}
	}).catch((error) => {
	});	
	
}

function guide_book_master_harness(player, soundOnOpen, soundOnClose) {
	if (soundOnOpen) {
		if(player.getDynamicProperty(LT_SOUNDS_SETTING) == 1) {
			player.playSound(soundOnOpen);
		}
	}

	read_guide_entry(player);

	if (soundOnClose) {
		if(player.getDynamicProperty(LT_SOUNDS_SETTING) == 1) {
			player.playSound(soundOnClose);
		}
	}	
}

show_form_on_item_use({
  itemTypeId: "twf_looky:guide",
  soundOnOpen: "random.chestopen",
  soundOnClose: "random.chestclosed"
});


const DEBUG = false;  // Shows block names
const eqo_guide= { type: "twf_looky:guide" };
const LT_NAME = "§l§eLooky Tool Item§r"
const LT_NAME_GUIDE = "§l§eLooky Book§r"
let looky_particle_select = 1;
const PROP_LOOKY_PARTICLE_SELECT = "looky_particle_select";
const ns = "minecraft:"
const mat = "diamond"
const LT_SWORD = ns+mat+"_sword";
const LT_SHEARS = ns+"shears";
const LT_AXE = ns+mat+"_axe";
const LT_SHOVEL = ns+mat+"_shovel";
const LT_PICKAXE = ns+mat+"_pickaxe";
const LT_HOE = ns+mat+"_hoe";
const LT_LEAD = ns+"lead";
const LT_BED = ns+"bed";

function give_spawn_item(player, itemTypeId, qty, name) {
	const propertyGiven = itemTypeId + '_given';	
	if(player.getDynamicProperty(propertyGiven) === undefined) {
		var item = new mc.ItemStack(itemTypeId, qty);
		item.nameTag = name;
		player.dimension.spawnItem(item, player.location);
		player.setDynamicProperty(propertyGiven, 1);
		player.setDynamicProperty(LT_SOUNDS_SETTING, 1);
		player.setDynamicProperty(LT_PARTICLES_SETTING, 1);
		player.setDynamicProperty(LT_DEFAULT_TOOL_SETTING, 1);
		player.setDynamicProperty(LT_GUIDE_PAGE_SETTING, 0); // Main form
	}
};

const excludeEntityTypes = [
  'minecraft:xp_orb',
  'minecraft:arrow',
  'minecraft:area_effect_cloud',
  'minecraft:chest_minecart',
  'minecraft:command_block_minecart',
  'minecraft:dragon_fireball',
  'minecraft:egg',
  'minecraft:ender_pearl',
  'minecraft:eye_of_ender_signal',
  'minecraft:fireball',
  'minecraft:fireworks_rocket',
  'minecraft:fishing_hook',
  'minecraft:hopper_minecart',
  'minecraft:lightning_bolt',
  'minecraft:lingering_potion',
  
]

const entity_tools = {
	'minecraft:allay' : 'minecraft:amethyst_shard',
	'minecraft:armor_stand' : LT_SWORD,
	'minecraft:axolotl' : LT_LEAD,
	'minecraft:bat' : LT_SWORD,
	'minecraft:blaze' : LT_SWORD,
	'minecraft:boat' : LT_LEAD,
	'minecraft:camel' : 'minecraft:cactus',
	'minecraft:cat' : 'minecraft:salmon',
	'minecraft:cave_spider' : LT_SWORD,
	'minecraft:chest_boat' : LT_LEAD,
	'minecraft:chest_minecart' : LT_SWORD,
	'minecraft:chicken' : "minecraft:wheat_seeds",
	'minecraft:cow' : "minecraft:wheat",
	'minecraft:creeper' : LT_SWORD,
	'minecraft:dolphin' : "minecraft:salmon",
	'minecraft:donkey' : "minecraft:golden_apple",
	'minecraft:drowned' : LT_SWORD,
	'minecraft:elder_guardian' : LT_SWORD,
	'minecraft:enderman' : LT_SWORD,
	'minecraft:endermite' : LT_SWORD,
	'minecraft:ender_crystal' : LT_SWORD,
	'minecraft:ender_dragon' : LT_BED,
	'minecraft:evocation_illager' : LT_SWORD,
	'minecraft:cod' : "minecraft:water_bucket",
	'minecraft:fox' : "minecraft:sweet_berries",
	'minecraft:frog' : "minecraft:slime_ball",
	'minecraft:ghast' : LT_SWORD,
	'minecraft:glow_squid' : LT_SWORD,
	'minecraft:goat' : "minecraft:wheat",
	'minecraft:guardian' : LT_SWORD,
	'minecraft:hoglin' : LT_SWORD,
	'minecraft:horse' : LT_LEAD,
	'minecraft:husk' : LT_SWORD,
	'minecraft:iron_golem' : LT_LEAD,
	'minecraft:llama' : LT_LEAD,
	'minecraft:magma_cube' : LT_SWORD,
	'minecraft:mooshroom' : "minecraft:bowl",
	'minecraft:mule' : LT_LEAD,
	'minecraft:ocelot' : "minecraft:salmon",
	'minecraft:panda' : "minecraft:bamboo",
	'minecraft:parrot' : "minecraft:wheat_seeds",
	'minecraft:phantom' : LT_SWORD,
	'minecraft:pig' : "minecraft:carrot",
	'minecraft:piglin' : "minecraft:golden_sword",
	'minecraft:piglin_brute' : "minecraft:golden_sword",
	'minecraft:pillager' : LT_SWORD,
	'minecraft:polar_bear' : LT_SWORD,
	'minecraft:pufferfish' : "minecraft:water_bucket",
	'minecraft:rabbit' : "minecraft:carrot",
	'minecraft:ravager' : LT_SWORD,
	'minecraft:salmon' : "minecraft:water_bucket",
	'minecraft:sheep' : LT_SHEARS,
	'minecraft:shulker' : LT_SWORD,
	'minecraft:silverfish' : LT_SWORD,
	'minecraft:skeleton' : LT_SWORD,
	'minecraft:skeleton_horse' : LT_LEAD,
	'minecraft:slime' : LT_SWORD,
	'minecraft:sniffer' : "minecraft:torchflower_seeds",
	'minecraft:snow_golem' : LT_SHOVEL,
	'minecraft:spider' : LT_SWORD,
	'minecraft:squid' : LT_SWORD,
	'minecraft:stray' : LT_SWORD,
	'minecraft:strider' : "minecraft:saddle",
	'minecraft:tadpole' : "minecraft:slime_ball",
	'minecraft:tropicalfish' : "minecraft:water_bucket",
	'minecraft:turtle' : "minecraft:seagrass",
	'minecraft:vex' : LT_SWORD,
	'minecraft:villager' : "minecraft:emerald",
	'minecraft:villager_v2' : "minecraft:emerald",
	'minecraft:vindicator' : LT_SWORD,
	'minecraft:wandering_trader' : "minecraft:emerald",
	'minecraft:warden' : "minecraft:snowball",
	'minecraft:witch' : LT_SWORD,
	'minecraft:wither' : LT_SWORD,
	'minecraft:wither_skeleton' : LT_SWORD,
	'minecraft:wolf' : "minecraft:bone",
	'minecraft:zoglin' : LT_SWORD,
	'minecraft:zombie' : LT_SWORD,
	'minecraft:zombie_horse' : LT_LEAD,
	'minecraft:zombie_pigman' : LT_SWORD,
	'minecraft:zombie_villager' : "minecraft:golden_appple",
	'minecraft:zombie_villager_v2' : "minecraft:golden_appple",	
}

const block_families = {
	"dirt" : LT_SHOVEL,
	"sandstone" : LT_PICKAXE,
	"sand" : LT_SHOVEL, // Sandstone override
	"soil" : LT_SHOVEL,
	"snow" : LT_SHOVEL,
	"gravel" : LT_SHOVEL,
	"grass" : LT_SHOVEL,
	
	"wheat" : LT_SWORD,
	"cane" : LT_SWORD,
	"cactus" : LT_SWORD,
	"sapling" : LT_SWORD,
	"vine" : LT_SWORD,
	"command" : LT_SWORD,
	"repeater" : LT_SWORD,
	"button" : LT_SWORD,

	"wood" : LT_AXE,
	"planks" : LT_AXE,
	"chest" : LT_AXE,
	"log" : LT_AXE,
	"table" : LT_AXE,
	"mushroom" : LT_AXE,
	"pumpkin" : LT_AXE,
	"melon" : LT_AXE,
	"fence" : LT_AXE,
	"door" : LT_AXE,
	"sign" : LT_AXE,
	"bamboo" : LT_AXE,
	"stem" : LT_AXE,
	"fungus" : LT_AXE,
	"wart" : LT_HOE,
	
	"leaves" : LT_SHEARS
}

const block_tools = {
	"minecraft:ladder" : LT_AXE,
	"minecraft:bookshelf" : LT_AXE,
	"minecraft:loom" : LT_AXE,
	"minecraft:bee_nest" : LT_SHEARS,
	"minecraft:beehive" : LT_AXE,
	
	"minecraft:farmland" : LT_SHOVEL,
	"minecraft:clay" : LT_SHOVEL,
	"minecraft:podzol" : LT_SHOVEL,
	"minecraft:mycelium" : LT_SHOVEL,
	
	"minecraft:dirt" : LT_HOE,
	"minecraft:grass_block"	: LT_HOE,
	
	"minecraft:tallgrass"	: LT_SWORD,
	"minecraft:double_plant"	: LT_SWORD,
	"minecraft:web" : LT_SWORD,
	
	"minecraft:iron_trapdoor" : LT_PICKAXE,
	"minecraft:iron_door" : LT_PICKAXE,
	
	"minecraft:end_portal_frame" : "minecraft:ender_eye",
	"minecraft:mob_spawner" : "minecraft:torch",
	
	"minecraft:bedrock" : undefined
}

function match_block_to_tool(cast, tool, player_grass_tool_preference) {
	let i = 0;

	try {
		let block_name = cast.block.getItemStack()?.typeId;
		if( DEBUG ) {
			mc.world.sendMessage(String(block_name));
		}
		let new_tool = block_tools[block_name];
		//  Grass/dirt handling override
		if(new_tool == LT_HOE && player_grass_tool_preference == 1 && (block_name == "minecraft:dirt" || block_name == "minecraft:grass_block")) {
			new_tool = LT_SHOVEL;
		}
		
		if(new_tool == undefined) {  // Wasn't a match
			// Try substring matching for families of blocks
			for(let k of Object.keys(block_families)) {
				if (block_name.includes(k)) {
					return block_families[k];
				}
			}
			return tool;
		}
		return new_tool;
	} catch(error) {
		// ignore
		// mc.world.sendMessage("TWFERR: "+String(error));
	}
	return tool
}

function is_a_looky_tool(itm) {
	if(itm !== undefined) {
		if(itm.nameTag == LT_NAME) {
			return true;
		}
	}
	return false;
}

function try_equip_and_swap(player, tool, active_slot_num, backup_slot_num) {
	const new_tool_id = tool;
	let inv = player.getComponent( 'inventory' ).container;
	let cur_item = inv.getItem(active_slot_num);

	let place_new_item_in_slot0 = false;
	let place_cur_item_in_backup = false;
	
	if(cur_item == undefined) { // Active slot is free
		place_new_item_in_slot0 = true;
	}
	else if(is_a_looky_tool(cur_item)) {
		if(cur_item.typeId !== new_tool_id) { // Only change item if it's a new type of candidate tool
			place_new_item_in_slot0 = true;
		}
	}

	// we now know if the active slot will be changing
	let bak_item = inv.getItem(backup_slot_num);
	if(place_new_item_in_slot0 == true) { // Because we're changing the active slot item, check if we should back it up in the backup slot
		

		if(bak_item == undefined) { // free slot use it
			place_cur_item_in_backup = true;
		}
		else if(is_a_looky_tool(bak_item)) {
			if (bak_item.typeId !== new_tool_id) {  // Don't bother swapping identical tool types
				place_cur_item_in_backup = true;
			}
		}
	}
		
	// Now we know enough to attempt to make changes
	if (place_cur_item_in_backup == true) {
		if(cur_item !== undefined) {  // Don't migrate empty slot
			inv.setItem(backup_slot_num, inv.getItem(active_slot_num));
		}
	}
	let newItem =  new mc.ItemStack(tool);	
	if (place_new_item_in_slot0 == true) {
		// Special handling - if the backup tool is the same type, use it instead
		if(bak_item?.typeId == newItem.typeId) {
			inv.setItem(active_slot_num, bak_item);
			inv.setItem(backup_slot_num, cur_item);
		}
		else {
			newItem.nameTag = LT_NAME;
			newItem.setLore([
				'§c§lCreated from§r',
				'§c§lwhat you§r',
				'§c§llooked at§r',
				
			]);			
			inv.setItem(active_slot_num, newItem);
		}
		return true
	}
	return false
}

mc.system.runInterval(() => {
	for (let player of mc.world.getAllPlayers()) {
		const equippable = player.getComponent("equippable");
		if (equippable !== undefined) {

			let is_looky_tool_equipped = false;
			for (const equipmentSlot of Object.values(mc.EquipmentSlot)) {
				let equipped_head = equippable.getEquipment("Head");
				if ((equipped_head !== undefined) && equipped_head.typeId == "twf_looky:guide") {
					is_looky_tool_equipped = true;
				}
			};

			if (is_looky_tool_equipped == true) {
				let cast = undefined;
				let tool_candidate_selected = false;
				let tool = undefined;
				let particle_loc = {x:undefined, y:undefined, z:undefined};

				let entityRayCastHit = player.getEntitiesFromViewDirection({
																maxDistance: 5,
																excludeEntityTypes
															  });
				if (entityRayCastHit.length > 0) {
					// mc.world.sendMessage(String(entityRayCastHit[0].entity.typeId));
					const entity_typeId = entityRayCastHit[0].entity.typeId;
					tool = entity_tools[entity_typeId];
					if(tool == undefined) {
						tool_candidate_selected = false;
						// tool = LT_SWORD;
					}
					else {
						tool_candidate_selected = true;
						particle_loc = { x: entityRayCastHit[0].entity.location.x,
										 y: entityRayCastHit[0].entity.location.y+0.4,
										 z: entityRayCastHit[0].entity.location.z
										};
					}
				}
				else {
					cast = player.getBlockFromViewDirection( { maxDistance: 8, includeLiquidBlocks: true });
					if(cast !== undefined){
						if(!cast.block.isAir) {
							tool = LT_PICKAXE; // Default tool
							if (cast.block.isLiquid) {
								tool = "minecraft:bucket"
							} else {
								tool = match_block_to_tool(cast, tool, player.getDynamicProperty(LT_DEFAULT_TOOL_SETTING));
								if (tool == LT_HOE) { // SPECIAL HANDLING: Replace hoe if the player is looking at a buried hoe block
									if ( !(player.dimension.getBlock( {x: cast.block.location.x, y: cast.block.location.y+1, z: cast.block.location.z}).isAir )) {
										tool = LT_SHOVEL;
									}
								}
							}
							if(tool !== undefined) {
								tool_candidate_selected = true;
								particle_loc = cast.block.location;
							}
						}
					}
				}
				if(tool_candidate_selected == true) {
					let result = try_equip_and_swap(player, tool, 0, 8);
					if(result == true) {
						if((particle_loc !== undefined))
						{
							let command_pos = String(Math.floor(particle_loc.x)) + " " +
												+ String(Math.floor(particle_loc.y)) + " " +
												+ String(Math.floor(particle_loc.z));
							
							if(player.getDynamicProperty(LT_PARTICLES_SETTING) == 1) {
								player.runCommand("/particle twf_looky:ring " + command_pos );
								player.runCommand("/particle twf_looky:rainbow_flame " + command_pos );
							}
							if(player.getDynamicProperty(LT_SOUNDS_SETTING) == 1) {
								player.runCommand("/playsound random.pop @s ~ ~ ~ 1.0 0.2 1.0");
							}
						}
						mc.world.scoreboard.getObjective('twf_looky:jig_computer.addon_stats')?.addScore('twf_looky:tools', 1);
					}
				}
			} else {
				// Clean up all Looky Tools in the inventory and the world
				const inv = player.getComponent( 'inventory' );
				if(inv) {
					const cont = inv.container;
					let cur_item = undefined;
					// mc.world.sendMessage(String(cont.size))
					for(let slot = 0; slot < cont.size; slot++) {
						// mc.world.sendMessage(String(slot));
						cur_item = cont.getItem(slot);
						if(cur_item !== undefined) {
							// mc.world.sendMessage(JSON.stringify(cur_item, undefined, 2))
							if(cur_item.nameTag === LT_NAME) {
								cont.setItem(slot, undefined);
							};
						};
					};
				};				
			};
			player.runCommandAsync("/kill @e[name=\""+LT_NAME+"\"]");
		}
	}
}, 13)

mc.world.afterEvents.playerSpawn.subscribe(event => {
	const players = mc.world.getPlayers( { playerId: event.playerId } );
	for ( let player of players ) {
		give_spawn_item(player, eqo_guide.type, 1, LT_NAME_GUIDE);
	}
});



try {
	mc.world.scoreboard.addObjective('twf_looky:jig_computer.addon_stats','dummy')
} catch(error)
{
	// ignore - if we're already tracking stats that's ok
}

