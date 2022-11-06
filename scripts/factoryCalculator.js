const fs = require("fs");
const path = require("path");
var items = {};
const rawRecipes = ["Iron Ore", "Copper Ore", "Silicon Ore", "Optical Grating Crystal", "Water", "Sulphuric Acid", "Titanium Ore", "Spiniform Stalagmite Crystal", "Hydrogen", "Crude Oil", "Graphene", "Stone", "Coal", "Kimberlite Ore"];

class Recipe{
	constructor(recipe){
		this.madePerMin = recipe[0];
		this.requirements = recipe.slice(1);
	}
}

async function calculateMachines(item, rate, factory = [], madeFor = ""){
	if(rawRecipes.includes(item)){
		factory.push([item, rate, madeFor]);
		return factory;
	}
	else if(items[item] == undefined){
		return factory;
	}
	var machines = Math.round(rate/items[item].madePerMin);
	if(madeFor != ""){
		factory.push([item, machines, madeFor]);
	}
	else{
		factory.push([item, machines]);
	}
	var requirements = items[item].requirements;
	for(var i = 0; i < requirements.length; i++){
		factory = await calculateMachines(requirements[i][0], requirements[i][1]*machines, factory, item);
	}
	return factory;
}

function compareArray(a, b){
	if(a[2] == b[0]){
		return 0;
	}
	else {
		return 1;
	}
}

async function main(desiredItem, desiredRate){
	const itemList = JSON.parse(fs.readFileSync(path.join(__dirname, "./recipes.json"), "utf8"));
	for(var i = 0; i < itemList.length; i++){
		var key = Object.keys(itemList[i])[0];
		var value = itemList[i][key];
		items[key] = new Recipe(value);
	}
	var machinesRequired = await calculateMachines(desiredItem, desiredRate);
	machinesRequired.sort(compareArray);
	// console.log(machinesRequired);
	await prettyPrintList(machinesRequired);
	var rawRequired = {};
	for(var i = 0; i < machinesRequired.length; i++){
		if(rawRecipes.includes(machinesRequired[i][0])){
			if(Object.keys(rawRequired).includes(machinesRequired[i][0])){
				rawRequired[machinesRequired[i][0]] += machinesRequired[i][1];
			}
			else{
				rawRequired[machinesRequired[i][0]] = machinesRequired[i][1];
			}
		}
	}
	console.log();
	console.log(rawRequired);
}

async function prettyPrintList(recipeList){
	var lastItem = "This can be any string lmao";
	var currentIndent = -1;
	var indents = {};

	for(var i = 0; i < recipeList.length; i++){
		var item = recipeList[i][0];
		var parent = recipeList[i][2];

		if(!Object.keys(indents).includes(parent)){
			// if parent of current item not already printed
			indents[parent] = currentIndent;
			currentIndent++;
		}
		else{
			currentIndent = indents[parent] + 1
		}

		lastItem = item;

		console.log("  ".repeat(currentIndent) + `${item} -> ${recipeList[i][1]}`);
	}

	return;
}

main("Sorter Mk.II", 120);