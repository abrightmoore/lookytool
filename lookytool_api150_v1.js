import * as mc from "@minecraft/server";

// @TheWorldFoundry
mc.world.sendMessage("LOOKYTOOL by @TheWorldFoundry");

const ns = "minecraft:"
const mat = "diamond"

const axe_blocks = [
	"acacia_log",
	"birch_log",
	"cherry_log",
	"dark_oak_log",
	"jungle_log",
	"mangrove_log",
	"oak_log",	
	"spruce_log",
	"stripped_acacia_log",
	"stripped_birch_log",
	"stripped_cherry_log",
	"stripped_dark_oak_log",
	"stripped_jungle_log",
	"stripped_mangrove_log",
	"stripped_oak_log",	
	"stripped_spruce_log",
	"crafting_table",
	"leaves",
	"leaves2",
	"azalea_leaves",
	"azalea_leaves_flowered",
	"cherry_leaves",
	"mangrove_leaves",
	"pumpkin",
	"carved_pumpkin",
	"lit_pumpkin",
	"melon_block"
];

const shovel_blocks = [
	"sand",
	"farmland",
	"grass_path",
	"dirt_with_roots",
	"gravel",
	"suspicious_gravel",
	"clay",
	"soul_sand",
	"soul_soil",
	"snow",
	"snow_layer",
	"powder_snow"
];

const hoe_blocks = [
	"dirt",
	"grass"
]

mc.system.runInterval(() => {
	for (let player of mc.world.getAllPlayers()) {
		let cast = player.getBlockFromViewDirection( { maxDistance: 8, includeLiquidBlocks: true });
		if(cast !== undefined){
//			mc.world.sendMessage(JSON.stringify(cast));
			
			if(!cast.block.isAir) {
				let inv = player.getComponent( 'inventory' ).container;

				let tool = mat+"_pickaxe" // Default tool
				if (cast.block.isLiquid) {
					tool = "bucket"
				} else {
					let material = 0;
					for (material in axe_blocks) {
						if(cast.block.permutation.matches(ns+axe_blocks[material])) {
							tool = mat+"_axe"
						}
					}
					for (material in hoe_blocks) {
						if(cast.block.permutation.matches(ns+hoe_blocks[material])) {
							tool = mat+"_hoe"
						}
					}
					for (material in shovel_blocks) {
						if(cast.block.permutation.matches(ns+shovel_blocks[material])) {
							tool = mat+"_shovel"
						}
					}
					
				}
				
				var newItem =  new mc.ItemStack(ns+tool);
				if (inv.getItem(0) == undefined || inv.getItem(0).typeId !== newItem.typeId) {   // A change
					if (inv.getItem(0) !== undefined) {
						inv.setItem(8, inv.getItem(0)); // Move the old item out
					}
					inv.setItem(0, newItem);        // Set the new tool

				}				
//				const equipment = player.getComponent("equippable");
//				equipment.setEquipment(mc.EquipmentSlot.Mainhand, new mc.ItemStack(tool));
			}
		}
	}
}, 5)
