export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["3d-maps/Basic_Town.json","3d-maps/Burnt_Tree_Map.json","3d-maps/Farm_City.json","3d-maps/Spread_Out_Town.json","3d-maps/Windmills___Such_.json","3d-maps/default_map.json","3d-models/Animated Animal Pack-glb/Alpaca.glb","3d-models/Animated Animal Pack-glb/Bull.glb","3d-models/Animated Animal Pack-glb/Cow.glb","3d-models/Animated Animal Pack-glb/Deer.glb","3d-models/Animated Animal Pack-glb/Donkey.glb","3d-models/Animated Animal Pack-glb/Fox.glb","3d-models/Animated Animal Pack-glb/Horse.glb","3d-models/Animated Animal Pack-glb/Husky.glb","3d-models/Animated Animal Pack-glb/Shiba Inu.glb","3d-models/Animated Animal Pack-glb/Stag.glb","3d-models/Animated Animal Pack-glb/White Horse.glb","3d-models/Animated Animal Pack-glb/Wolf.glb","3d-models/Animated Enemies-glb/Frog.glb","3d-models/Animated Enemies-glb/Rat.glb","3d-models/Animated Enemies-glb/Snake.glb","3d-models/Animated Enemies-glb/Spider.glb","3d-models/Animated Enemies-glb/Wasp.glb","3d-models/Campfire.mtl","3d-models/Campfire.obj","3d-models/Cars Bundle-glb/Car-unqqkULtRU.glb","3d-models/Cars Bundle-glb/Car.glb","3d-models/Cars Bundle-glb/Police Car.glb","3d-models/Cars Bundle-glb/SUV.glb","3d-models/Cars Bundle-glb/Sports Car-1mkmFkAz5v.glb","3d-models/Cars Bundle-glb/Sports Car.glb","3d-models/Cars Bundle-glb/Taxi.glb","3d-models/City Pack.undefined-glb/ATM.glb","3d-models/City Pack.undefined-glb/Adventurer.glb","3d-models/City Pack.undefined-glb/Air conditioner.glb","3d-models/City Pack.undefined-glb/Animated Woman-nIItLV9nxS.glb","3d-models/City Pack.undefined-glb/Animated Woman-qJ2gsTUBHL.glb","3d-models/City Pack.undefined-glb/Animated Woman.glb","3d-models/City Pack.undefined-glb/Bench.glb","3d-models/City Pack.undefined-glb/Bicycle.glb","3d-models/City Pack.undefined-glb/Big Building.glb","3d-models/City Pack.undefined-glb/Billboard.glb","3d-models/City Pack.undefined-glb/Box.glb","3d-models/City Pack.undefined-glb/Brown Building.glb","3d-models/City Pack.undefined-glb/Building Green.glb","3d-models/City Pack.undefined-glb/Building Red Corner.glb","3d-models/City Pack.undefined-glb/Building Red.glb","3d-models/City Pack.undefined-glb/Bus Stop.glb","3d-models/City Pack.undefined-glb/Bus stop sign.glb","3d-models/City Pack.undefined-glb/Bus.glb","3d-models/City Pack.undefined-glb/Car-unqqkULtRU.glb","3d-models/City Pack.undefined-glb/Car.glb","3d-models/City Pack.undefined-glb/Cone.glb","3d-models/City Pack.undefined-glb/Debris Papers.glb","3d-models/City Pack.undefined-glb/Dumpster.glb","3d-models/City Pack.undefined-glb/Fence End.glb","3d-models/City Pack.undefined-glb/Fence Piece.glb","3d-models/City Pack.undefined-glb/Fence.glb","3d-models/City Pack.undefined-glb/Fire Exit.glb","3d-models/City Pack.undefined-glb/Fire hydrant.glb","3d-models/City Pack.undefined-glb/Floor Hole.glb","3d-models/City Pack.undefined-glb/Flower Pot-Kgt363WkKd.glb","3d-models/City Pack.undefined-glb/Flower Pot.glb","3d-models/City Pack.undefined-glb/Gb Blank.glb","3d-models/City Pack.undefined-glb/Greenhouse.glb","3d-models/City Pack.undefined-glb/Mailbox.glb","3d-models/City Pack.undefined-glb/Man.glb","3d-models/City Pack.undefined-glb/Manhole Cover.glb","3d-models/City Pack.undefined-glb/Motorcycle.glb","3d-models/City Pack.undefined-glb/Pickup Truck.glb","3d-models/City Pack.undefined-glb/Pizza Corner.glb","3d-models/City Pack.undefined-glb/Planter & Bushes.glb","3d-models/City Pack.undefined-glb/Police Car.glb","3d-models/City Pack.undefined-glb/Power Box.glb","3d-models/City Pack.undefined-glb/RB Blank.glb","3d-models/City Pack.undefined-glb/Road Bits.glb","3d-models/City Pack.undefined-glb/Rock band poster.glb","3d-models/City Pack.undefined-glb/Roof Exit.glb","3d-models/City Pack.undefined-glb/SUV.glb","3d-models/City Pack.undefined-glb/Sports Car-Gzj704DXdr.glb","3d-models/City Pack.undefined-glb/Sports Car.glb","3d-models/City Pack.undefined-glb/Stop sign.glb","3d-models/City Pack.undefined-glb/Traffic Light.glb","3d-models/City Pack.undefined-glb/Trash Can.glb","3d-models/City Pack.undefined-glb/Tree.glb","3d-models/City Pack.undefined-glb/Van.glb","3d-models/City Pack.undefined-glb/Washing Line.glb","3d-models/City Pack.undefined-glb/Yellow Post-it.glb","3d-models/City Pack.undefined-glb/trah bag grey.glb","3d-models/Cube World Kit-glb/Axe Stone.glb","3d-models/Cube World Kit-glb/Bamboo Mid.glb","3d-models/Cube World Kit-glb/Bamboo-xBPj13w3JQ.glb","3d-models/Cube World Kit-glb/Bamboo.glb","3d-models/Cube World Kit-glb/Big Crystal.glb","3d-models/Cube World Kit-glb/Blank block.glb","3d-models/Cube World Kit-glb/Brick Block.glb","3d-models/Cube World Kit-glb/Bush.glb","3d-models/Cube World Kit-glb/Button.glb","3d-models/Cube World Kit-glb/Cat.glb","3d-models/Cube World Kit-glb/Cheese Block.glb","3d-models/Cube World Kit-glb/Chest Open.glb","3d-models/Cube World Kit-glb/Chick.glb","3d-models/Cube World Kit-glb/Chicken.glb","3d-models/Cube World Kit-glb/Coal Block.glb","3d-models/Cube World Kit-glb/Crate.glb","3d-models/Cube World Kit-glb/Crystal Block.glb","3d-models/Cube World Kit-glb/Crystal.glb","3d-models/Cube World Kit-glb/Cube Guy Character.glb","3d-models/Cube World Kit-glb/Cube Woman Character.glb","3d-models/Cube World Kit-glb/Dead Tree-4E3IOActVF.glb","3d-models/Cube World Kit-glb/Dead Tree-9dGXS7GrWc.glb","3d-models/Cube World Kit-glb/Dead Tree.glb","3d-models/Cube World Kit-glb/Demon.glb","3d-models/Cube World Kit-glb/Diamond Axe.glb","3d-models/Cube World Kit-glb/Diamond Block.glb","3d-models/Cube World Kit-glb/Diamond Pickaxe.glb","3d-models/Cube World Kit-glb/Diamond Shovel.glb","3d-models/Cube World Kit-glb/Dirt Block.glb","3d-models/Cube World Kit-glb/Dog.glb","3d-models/Cube World Kit-glb/Fence Center.glb","3d-models/Cube World Kit-glb/Fence Corner.glb","3d-models/Cube World Kit-glb/Fence End.glb","3d-models/Cube World Kit-glb/Fence T.glb","3d-models/Cube World Kit-glb/Flowers-0mxlGKYE9P.glb","3d-models/Cube World Kit-glb/Flowers.glb","3d-models/Cube World Kit-glb/Giant.glb","3d-models/Cube World Kit-glb/Goblin.glb","3d-models/Cube World Kit-glb/Gold Axe.glb","3d-models/Cube World Kit-glb/Gold Sword.glb","3d-models/Cube World Kit-glb/Grass Block.glb","3d-models/Cube World Kit-glb/Grass Small.glb","3d-models/Cube World Kit-glb/Grass.glb","3d-models/Cube World Kit-glb/Grey Bricks.glb","3d-models/Cube World Kit-glb/Hedgehog.glb","3d-models/Cube World Kit-glb/Horse.glb","3d-models/Cube World Kit-glb/Ice Block.glb","3d-models/Cube World Kit-glb/Key.glb","3d-models/Cube World Kit-glb/Lever.glb","3d-models/Cube World Kit-glb/Metal Block.glb","3d-models/Cube World Kit-glb/Metal Door.glb","3d-models/Cube World Kit-glb/Mushroom.glb","3d-models/Cube World Kit-glb/Pickaxe Gold.glb","3d-models/Cube World Kit-glb/Pickaxe Wood.glb","3d-models/Cube World Kit-glb/Pig.glb","3d-models/Cube World Kit-glb/Plant-n31PjUy6Ra.glb","3d-models/Cube World Kit-glb/Plant.glb","3d-models/Cube World Kit-glb/Raccoon.glb","3d-models/Cube World Kit-glb/Rail Corner.glb","3d-models/Cube World Kit-glb/Rail Incline.glb","3d-models/Cube World Kit-glb/Rail Straight.glb","3d-models/Cube World Kit-glb/Rock-Xx1Jkg77vJ.glb","3d-models/Cube World Kit-glb/Rock.glb","3d-models/Cube World Kit-glb/Sheep.glb","3d-models/Cube World Kit-glb/Shovel Gold.glb","3d-models/Cube World Kit-glb/Skeleton.glb","3d-models/Cube World Kit-glb/Snow Block.glb","3d-models/Cube World Kit-glb/Steve.glb","3d-models/Cube World Kit-glb/Stone Block.glb","3d-models/Cube World Kit-glb/Stone Pickaxe.glb","3d-models/Cube World Kit-glb/Stone Shovel.glb","3d-models/Cube World Kit-glb/Sword Diamond.glb","3d-models/Cube World Kit-glb/Sword Stone.glb","3d-models/Cube World Kit-glb/Tree-ahBEW2RRgq.glb","3d-models/Cube World Kit-glb/Tree-s8XdT4FOZz.glb","3d-models/Cube World Kit-glb/Tree.glb","3d-models/Cube World Kit-glb/Wolf.glb","3d-models/Cube World Kit-glb/Wood Axe.glb","3d-models/Cube World Kit-glb/Wood Chest.glb","3d-models/Cube World Kit-glb/Wood Planks Block.glb","3d-models/Cube World Kit-glb/Wood Shovel.glb","3d-models/Cube World Kit-glb/Wooden Sword.glb","3d-models/Cube World Kit-glb/Yeti.glb","3d-models/Cube World Kit-glb/Zombie.glb","3d-models/Cube World Kit-glb/minecart.glb","3d-models/Farm Animal Pack-glb/Cow.glb","3d-models/Farm Animal Pack-glb/Horse.glb","3d-models/Farm Animal Pack-glb/Llama.glb","3d-models/Farm Animal Pack-glb/Pig.glb","3d-models/Farm Animal Pack-glb/Pug.glb","3d-models/Farm Animal Pack-glb/Sheep.glb","3d-models/Farm Animal Pack-glb/Zebra.glb","3d-models/Farm Buildings Bundle-glb/Barn.glb","3d-models/Farm Buildings Bundle-glb/Big Barn.glb","3d-models/Farm Buildings Bundle-glb/ChickenCoop.glb","3d-models/Farm Buildings Bundle-glb/Fence-e02PFKKhbr.glb","3d-models/Farm Buildings Bundle-glb/Fence.glb","3d-models/Farm Buildings Bundle-glb/Open Barn.glb","3d-models/Farm Buildings Bundle-glb/Silo House.glb","3d-models/Farm Buildings Bundle-glb/Silo.glb","3d-models/Farm Buildings Bundle-glb/Small Barn.glb","3d-models/Farm Buildings Bundle-glb/Tower Windmill.glb","3d-models/Post Apocolypse Pack-glb/Axe.glb","3d-models/Post Apocolypse Pack-glb/Barrel.glb","3d-models/Post Apocolypse Pack-glb/Big arm.glb","3d-models/Post Apocolypse Pack-glb/Blood Splat-oQDW3k5As5.glb","3d-models/Post Apocolypse Pack-glb/Blood Splat.glb","3d-models/Post Apocolypse Pack-glb/Blood.glb","3d-models/Post Apocolypse Pack-glb/Characters Matt.glb","3d-models/Post Apocolypse Pack-glb/Characters Pug.glb","3d-models/Post Apocolypse Pack-glb/Characters Sam.glb","3d-models/Post Apocolypse Pack-glb/Characters Shaun.glb","3d-models/Post Apocolypse Pack-glb/Chest-RfSBvgcZUD.glb","3d-models/Post Apocolypse Pack-glb/Chest.glb","3d-models/Post Apocolypse Pack-glb/Cinder Block.glb","3d-models/Post Apocolypse Pack-glb/Container Green.glb","3d-models/Post Apocolypse Pack-glb/Container Red.glb","3d-models/Post Apocolypse Pack-glb/Cross walk.glb","3d-models/Post Apocolypse Pack-glb/Damaged Couch.glb","3d-models/Post Apocolypse Pack-glb/Fire Hydrant.glb","3d-models/Post Apocolypse Pack-glb/German Shepard.glb","3d-models/Post Apocolypse Pack-glb/Guitar.glb","3d-models/Post Apocolypse Pack-glb/Knife.glb","3d-models/Post Apocolypse Pack-glb/Lis.glb","3d-models/Post Apocolypse Pack-glb/Pallet Broken.glb","3d-models/Post Apocolypse Pack-glb/Pallet.glb","3d-models/Post Apocolypse Pack-glb/Pipes.glb","3d-models/Post Apocolypse Pack-glb/Pistol.glb","3d-models/Post Apocolypse Pack-glb/Plastic Barrier.glb","3d-models/Post Apocolypse Pack-glb/Rifle.glb","3d-models/Post Apocolypse Pack-glb/Shotgun.glb","3d-models/Post Apocolypse Pack-glb/Smg.glb","3d-models/Post Apocolypse Pack-glb/Spear.glb","3d-models/Post Apocolypse Pack-glb/Street Light.glb","3d-models/Post Apocolypse Pack-glb/Street Straight Crack-l7c8pppfFj.glb","3d-models/Post Apocolypse Pack-glb/Street Straight Crack.glb","3d-models/Post Apocolypse Pack-glb/Street Straight.glb","3d-models/Post Apocolypse Pack-glb/Street T.glb","3d-models/Post Apocolypse Pack-glb/Street Turn.glb","3d-models/Post Apocolypse Pack-glb/Town Sign.glb","3d-models/Post Apocolypse Pack-glb/Traffic Barrier-nugx3heueH.glb","3d-models/Post Apocolypse Pack-glb/Traffic Barrier.glb","3d-models/Post Apocolypse Pack-glb/Traffic Cone-VGvQupNGtK.glb","3d-models/Post Apocolypse Pack-glb/Traffic Cone.glb","3d-models/Post Apocolypse Pack-glb/Traffic Light-lg9AKWejnF.glb","3d-models/Post Apocolypse Pack-glb/Traffic Light.glb","3d-models/Post Apocolypse Pack-glb/Trash Bag.glb","3d-models/Post Apocolypse Pack-glb/Trash Bags.glb","3d-models/Post Apocolypse Pack-glb/Water Tower.glb","3d-models/Post Apocolypse Pack-glb/Wheel.glb","3d-models/Post Apocolypse Pack-glb/Wheels Stack.glb","3d-models/Post Apocolypse Pack-glb/Wooden Bat Barbed.glb","3d-models/Post Apocolypse Pack-glb/Wooden Bat Saw.glb","3d-models/Post Apocolypse Pack-glb/Zombie half.glb","3d-models/Post Apocolypse Pack-glb/Zombie-VlXjG0N8Eg.glb","3d-models/Post Apocolypse Pack-glb/Zombie.glb","3d-models/Stylized Nature MegaKit.undefined-glb/Bush with Flowers.glb","3d-models/Stylized Nature MegaKit.undefined-glb/Bush.glb","3d-models/Stylized Nature MegaKit.undefined-glb/Clover-u5SOgBFiut.glb","3d-models/Stylized Nature MegaKit.undefined-glb/Clover.glb","3d-models/Stylized Nature MegaKit.undefined-glb/Dead Tree-CD4edbPSGm.glb","3d-models/Stylized Nature MegaKit.undefined-glb/Dead Tree-Mcd2zYqyww.glb","3d-models/Stylized Nature MegaKit.undefined-glb/Dead Tree-MlmK5488ou.glb","3d-models/Stylized Nature MegaKit.undefined-glb/Dead Tree-n8FhMgMldD.glb","3d-models/Stylized Nature MegaKit.undefined-glb/Dead Tree.glb","3d-models/Stylized Nature MegaKit.undefined-glb/Fern.glb","3d-models/Stylized Nature MegaKit.undefined-glb/Flower Group-LqTljN6Wg2.glb","3d-models/Stylized Nature MegaKit.undefined-glb/Flower Group.glb","3d-models/Stylized Nature MegaKit.undefined-glb/Flower Petal-LqvxG9OBOU.glb","3d-models/Stylized Nature MegaKit.undefined-glb/Flower Petal-eVE0j49ux9.glb","3d-models/Stylized Nature MegaKit.undefined-glb/Flower Petal-niuBUEJdvM.glb","3d-models/Stylized Nature MegaKit.undefined-glb/Flower Petal-tzG4JcqYWs.glb","3d-models/Stylized Nature MegaKit.undefined-glb/Flower Petal.glb","3d-models/Stylized Nature MegaKit.undefined-glb/Flower Single-GvfHo0roi3.glb","3d-models/Stylized Nature MegaKit.undefined-glb/Flower Single.glb","3d-models/Stylized Nature MegaKit.undefined-glb/Grass Wispy-Msr9zx66VU.glb","3d-models/Stylized Nature MegaKit.undefined-glb/Grass Wispy.glb","3d-models/Stylized Nature MegaKit.undefined-glb/Grass.glb","3d-models/Stylized Nature MegaKit.undefined-glb/Mushroom Laetiporus.glb","3d-models/Stylized Nature MegaKit.undefined-glb/Mushroom.glb","3d-models/Stylized Nature MegaKit.undefined-glb/Pebble Round-KYtJ6JNXh2.glb","3d-models/Stylized Nature MegaKit.undefined-glb/Pebble Round-icVsN3lmVy.glb","3d-models/Stylized Nature MegaKit.undefined-glb/Pebble Round-kAMfq1uJUY.glb","3d-models/Stylized Nature MegaKit.undefined-glb/Pebble Round-nMf8LHOsbM.glb","3d-models/Stylized Nature MegaKit.undefined-glb/Pebble Round.glb","3d-models/Stylized Nature MegaKit.undefined-glb/Pebble Square-2YtLzwgsWp.glb","3d-models/Stylized Nature MegaKit.undefined-glb/Pebble Square-6juX57sLHe.glb","3d-models/Stylized Nature MegaKit.undefined-glb/Pebble Square-Mm4RMgwNO8.glb","3d-models/Stylized Nature MegaKit.undefined-glb/Pebble Square-l5XiYQj1oD.glb","3d-models/Stylized Nature MegaKit.undefined-glb/Pebble Square-s71L3q1nXN.glb","3d-models/Stylized Nature MegaKit.undefined-glb/Pebble Square.glb","3d-models/Stylized Nature MegaKit.undefined-glb/Pine-699sFuLCN2.glb","3d-models/Stylized Nature MegaKit.undefined-glb/Pine-79gmlLnweB.glb","3d-models/Stylized Nature MegaKit.undefined-glb/Pine-Zt62gceKXZ.glb","3d-models/Stylized Nature MegaKit.undefined-glb/Pine-rfnxJv0Rqa.glb","3d-models/Stylized Nature MegaKit.undefined-glb/Pine.glb","3d-models/Stylized Nature MegaKit.undefined-glb/Plant Big-MbhbP7JrTI.glb","3d-models/Stylized Nature MegaKit.undefined-glb/Plant Big.glb","3d-models/Stylized Nature MegaKit.undefined-glb/Plant-xH5gNlQxAZ.glb","3d-models/Stylized Nature MegaKit.undefined-glb/Plant.glb","3d-models/Stylized Nature MegaKit.undefined-glb/Rock Medium-JQxF95498B.glb","3d-models/Stylized Nature MegaKit.undefined-glb/Rock Medium-s1OJ3bBzqc.glb","3d-models/Stylized Nature MegaKit.undefined-glb/Rock Medium.glb","3d-models/Stylized Nature MegaKit.undefined-glb/Rock Path Round Small-GMttpOEFKT.glb","3d-models/Stylized Nature MegaKit.undefined-glb/Rock Path Round Small-yHEdadj5I0.glb","3d-models/Stylized Nature MegaKit.undefined-glb/Rock Path Round Small.glb","3d-models/Stylized Nature MegaKit.undefined-glb/Rock Path Round Thin.glb","3d-models/Stylized Nature MegaKit.undefined-glb/Rock Path Round Wide.glb","3d-models/Stylized Nature MegaKit.undefined-glb/Rock Path Square Smal-cI9XBpVijV.glb","3d-models/Stylized Nature MegaKit.undefined-glb/Rock Path Square Smal-w4TKZMjjcw.glb","3d-models/Stylized Nature MegaKit.undefined-glb/Rock Path Square Smal.glb","3d-models/Stylized Nature MegaKit.undefined-glb/Rock Path Square Thin.glb","3d-models/Stylized Nature MegaKit.undefined-glb/Rock Path Square Wide.glb","3d-models/Stylized Nature MegaKit.undefined-glb/Tall Grass.glb","3d-models/Stylized Nature MegaKit.undefined-glb/Tree-QVOop92WmG.glb","3d-models/Stylized Nature MegaKit.undefined-glb/Tree-aVOxaHRPWe.glb","3d-models/Stylized Nature MegaKit.undefined-glb/Tree-qZtx0AHhcy.glb","3d-models/Stylized Nature MegaKit.undefined-glb/Tree-t9KbsfYdXz.glb","3d-models/Stylized Nature MegaKit.undefined-glb/Tree.glb","3d-models/Stylized Nature MegaKit.undefined-glb/Twisted Tree-7PDBpElkQr.glb","3d-models/Stylized Nature MegaKit.undefined-glb/Twisted Tree-8oraKn9m0x.glb","3d-models/Stylized Nature MegaKit.undefined-glb/Twisted Tree-9aWlx82xUf.glb","3d-models/Stylized Nature MegaKit.undefined-glb/Twisted Tree-GVTsMmuzv7.glb","3d-models/Stylized Nature MegaKit.undefined-glb/Twisted Tree.glb","3d-models/Ultimate Space Kit-glb/Astronaut-0D54W8yfrA.glb","3d-models/Ultimate Space Kit-glb/Astronaut-OgeSH89Nmx.glb","3d-models/Ultimate Space Kit-glb/Astronaut.glb","3d-models/Ultimate Space Kit-glb/Base Large.glb","3d-models/Ultimate Space Kit-glb/Building L.glb","3d-models/Ultimate Space Kit-glb/Bullets Pickup.glb","3d-models/Ultimate Space Kit-glb/Bush-RfUP3gXj69.glb","3d-models/Ultimate Space Kit-glb/Bush-tX1aT9IB1P.glb","3d-models/Ultimate Space Kit-glb/Bush.glb","3d-models/Ultimate Space Kit-glb/Connector.glb","3d-models/Ultimate Space Kit-glb/Enemy Flying.glb","3d-models/Ultimate Space Kit-glb/Enemy Large.glb","3d-models/Ultimate Space Kit-glb/Enemy Small.glb","3d-models/Ultimate Space Kit-glb/Geodesic Dome.glb","3d-models/Ultimate Space Kit-glb/Grass-Db4UVcNWnF.glb","3d-models/Ultimate Space Kit-glb/Grass-iw6l7gqcdQ.glb","3d-models/Ultimate Space Kit-glb/Grass.glb","3d-models/Ultimate Space Kit-glb/House Cylinder.glb","3d-models/Ultimate Space Kit-glb/House Long.glb","3d-models/Ultimate Space Kit-glb/House Open.glb","3d-models/Ultimate Space Kit-glb/House Pod.glb","3d-models/Ultimate Space Kit-glb/House Single Support.glb","3d-models/Ultimate Space Kit-glb/House Single.glb","3d-models/Ultimate Space Kit-glb/Mech-4UvIHxnoSR.glb","3d-models/Ultimate Space Kit-glb/Mech-D5wW2jDO42.glb","3d-models/Ultimate Space Kit-glb/Mech-o3Ps8z8ByP.glb","3d-models/Ultimate Space Kit-glb/Mech.glb","3d-models/Ultimate Space Kit-glb/Metal Support.glb","3d-models/Ultimate Space Kit-glb/Pickup Crate.glb","3d-models/Ultimate Space Kit-glb/Pickup Health.glb","3d-models/Ultimate Space Kit-glb/Pickup Jar.glb","3d-models/Ultimate Space Kit-glb/Pickup Key Card.glb","3d-models/Ultimate Space Kit-glb/Pickup Sphere.glb","3d-models/Ultimate Space Kit-glb/Pickup Thunder.glb","3d-models/Ultimate Space Kit-glb/Planet-18Uxrb2dIc.glb","3d-models/Ultimate Space Kit-glb/Planet-4NxxeyYMPJ.glb","3d-models/Ultimate Space Kit-glb/Planet-5zzi8WUMXj.glb","3d-models/Ultimate Space Kit-glb/Planet-9g1aIbfR9Y.glb","3d-models/Ultimate Space Kit-glb/Planet-B7xd3SZq0z.glb","3d-models/Ultimate Space Kit-glb/Planet-EC1Lk2IamI.glb","3d-models/Ultimate Space Kit-glb/Planet-IVnmauIgWX.glb","3d-models/Ultimate Space Kit-glb/Planet-hKZtOOMadH.glb","3d-models/Ultimate Space Kit-glb/Planet-pHZz4EMvVM.glb","3d-models/Ultimate Space Kit-glb/Planet-rYguWNNPvA.glb","3d-models/Ultimate Space Kit-glb/Planet.glb","3d-models/Ultimate Space Kit-glb/Plant-VwXvoIpCHP.glb","3d-models/Ultimate Space Kit-glb/Plant-s0joFFrQoy.glb","3d-models/Ultimate Space Kit-glb/Plant.glb","3d-models/Ultimate Space Kit-glb/Ramp.glb","3d-models/Ultimate Space Kit-glb/Rock Large-d2VWOdthtR.glb","3d-models/Ultimate Space Kit-glb/Rock Large-li0YBlBEMz.glb","3d-models/Ultimate Space Kit-glb/Rock Large.glb","3d-models/Ultimate Space Kit-glb/Rock-34W5ymEePk.glb","3d-models/Ultimate Space Kit-glb/Rock-R2UjZAX3By.glb","3d-models/Ultimate Space Kit-glb/Rock-b7gRkv0cEa.glb","3d-models/Ultimate Space Kit-glb/Rock.glb","3d-models/Ultimate Space Kit-glb/Roof Antenna.glb","3d-models/Ultimate Space Kit-glb/Roof Radar.glb","3d-models/Ultimate Space Kit-glb/Round Rover.glb","3d-models/Ultimate Space Kit-glb/Rover-WRd1piJOfh.glb","3d-models/Ultimate Space Kit-glb/Rover.glb","3d-models/Ultimate Space Kit-glb/Solar Panel Ground.glb","3d-models/Ultimate Space Kit-glb/Solar Panel Structure.glb","3d-models/Ultimate Space Kit-glb/Solar Panel.glb","3d-models/Ultimate Space Kit-glb/Spaceship-Jqfed124pQ.glb","3d-models/Ultimate Space Kit-glb/Spaceship-VSxUAFhzbA.glb","3d-models/Ultimate Space Kit-glb/Spaceship-u105mYHLHU.glb","3d-models/Ultimate Space Kit-glb/Spaceship.glb","3d-models/Ultimate Space Kit-glb/Stairs.glb","3d-models/Ultimate Space Kit-glb/Tree Blob-QHYRrAnKzW.glb","3d-models/Ultimate Space Kit-glb/Tree Blob-j0byyoIGOv.glb","3d-models/Ultimate Space Kit-glb/Tree Blob.glb","3d-models/Ultimate Space Kit-glb/Tree Floating-sdtjU7iczl.glb","3d-models/Ultimate Space Kit-glb/Tree Floating-tj2fePl8Eu.glb","3d-models/Ultimate Space Kit-glb/Tree Floating.glb","3d-models/Ultimate Space Kit-glb/Tree Lava-9gRfmVKx9W.glb","3d-models/Ultimate Space Kit-glb/Tree Lava-sTYjmQObr1.glb","3d-models/Ultimate Space Kit-glb/Tree Lava.glb","3d-models/Ultimate Space Kit-glb/Tree Light-om4BJAL82T.glb","3d-models/Ultimate Space Kit-glb/Tree Light.glb","3d-models/Ultimate Space Kit-glb/Tree Spikes-a6Vo1seJw9.glb","3d-models/Ultimate Space Kit-glb/Tree Spikes.glb","3d-models/Ultimate Space Kit-glb/Tree Spiral-gI3kqnqg80.glb","3d-models/Ultimate Space Kit-glb/Tree Spiral-kBomlgZ5xu.glb","3d-models/Ultimate Space Kit-glb/Tree Spiral.glb","3d-models/Ultimate Space Kit-glb/Tree Swirl-iLxXSXIx2t.glb","3d-models/Ultimate Space Kit-glb/Tree Swirl.glb","3d-models/Ultimate Stylized Nature Pack-glb/Birch Trees.glb","3d-models/Ultimate Stylized Nature Pack-glb/Bushes.glb","3d-models/Ultimate Stylized Nature Pack-glb/Dead Trees-F5I0Q7TwO5.glb","3d-models/Ultimate Stylized Nature Pack-glb/Dead Trees.glb","3d-models/Ultimate Stylized Nature Pack-glb/Flower Bushes.glb","3d-models/Ultimate Stylized Nature Pack-glb/Flowers.glb","3d-models/Ultimate Stylized Nature Pack-glb/Grass.glb","3d-models/Ultimate Stylized Nature Pack-glb/Maple Trees.glb","3d-models/Ultimate Stylized Nature Pack-glb/Palm Trees.glb","3d-models/Ultimate Stylized Nature Pack-glb/Pine Trees.glb","3d-models/Ultimate Stylized Nature Pack-glb/Rocks.glb","3d-models/Ultimate Stylized Nature Pack-glb/Trees.glb","3d-models/small-camping-bundle/.DS_Store","3d-models/small-camping-bundle/Campfire/Campfire.mtl","3d-models/small-camping-bundle/Campfire/Campfire.obj","3d-models/small-camping-bundle/Fire/fire.mtl","3d-models/small-camping-bundle/Fire/fire.obj","3d-models/small-camping-bundle/Island/Island.mtl","3d-models/small-camping-bundle/Island/Island.obj","3d-models/small-camping-bundle/Log/Log.mtl","3d-models/small-camping-bundle/Log/Log.obj","3d-models/small-camping-bundle/Log-W/ Axe/LogWAxe.mtl","3d-models/small-camping-bundle/Log-W/ Axe/LogWAxe.obj","3d-models/small-camping-bundle/Log-W/.DS_Store","3d-models/small-camping-bundle/Rock/Rock.mtl","3d-models/small-camping-bundle/Rock/Rock.obj","3d-models/small-camping-bundle/Tent/Tent.mtl","3d-models/small-camping-bundle/Tent/Tent.obj","3d-models/small-camping-bundle/Tree/Tree.mtl","3d-models/small-camping-bundle/Tree/Tree.obj","favicon.png","game-thumbs/.DS_Store","game-thumbs/cosmic-pong.jpg","game-thumbs/fps-game.jpg","game-thumbs/light-particles.jpg","game-thumbs/mine-buster.jpg","game-thumbs/snake-adelic.jpg","game-thumbs/space-invaders.jpg","game-thumbs/starship-flyer.jpg","game-thumbs/tower-assault.jpg","game-thumbs/world-builder.jpg","images/cm_logo.svg","images/example-home.png","images/rss.svg","modelCatalog.json","robots.txt"]),
	mimeTypes: {".json":"application/json",".glb":"model/gltf-binary",".mtl":"model/mtl",".obj":"model/obj",".png":"image/png",".jpg":"image/jpeg",".svg":"image/svg+xml",".txt":"text/plain"},
	_: {
		client: {start:"_app/immutable/entry/start.CR08UHm_.js",app:"_app/immutable/entry/app.Sizawyce.js",imports:["_app/immutable/entry/start.CR08UHm_.js","_app/immutable/chunks/DjOjdQGI.js","_app/immutable/chunks/Cmf6Gt0A.js","_app/immutable/chunks/DlewTG-N.js","_app/immutable/chunks/CPCmQVeX.js","_app/immutable/chunks/B22iR7fO.js","_app/immutable/chunks/Ds5ce2_J.js","_app/immutable/chunks/D0iwhpLH.js","_app/immutable/chunks/BEsKQ9o0.js","_app/immutable/entry/app.Sizawyce.js","_app/immutable/chunks/3WEM7Ar6.js","_app/immutable/chunks/DlewTG-N.js","_app/immutable/chunks/CPCmQVeX.js","_app/immutable/chunks/Bzak7iHL.js","_app/immutable/chunks/Cmf6Gt0A.js","_app/immutable/chunks/B22iR7fO.js","_app/immutable/chunks/Ds5ce2_J.js","_app/immutable/chunks/CKT1PtbG.js","_app/immutable/chunks/DgT1KRE_.js","_app/immutable/chunks/DknY6N_G.js","_app/immutable/chunks/CtyVW6ut.js","_app/immutable/chunks/BEsKQ9o0.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js')),
			__memo(() => import('./nodes/3.js')),
			__memo(() => import('./nodes/4.js')),
			__memo(() => import('./nodes/5.js')),
			__memo(() => import('./nodes/6.js')),
			__memo(() => import('./nodes/7.js')),
			__memo(() => import('./nodes/8.js')),
			__memo(() => import('./nodes/9.js')),
			__memo(() => import('./nodes/10.js')),
			__memo(() => import('./nodes/11.js')),
			__memo(() => import('./nodes/12.js')),
			__memo(() => import('./nodes/13.js')),
			__memo(() => import('./nodes/14.js')),
			__memo(() => import('./nodes/15.js')),
			__memo(() => import('./nodes/16.js')),
			__memo(() => import('./nodes/17.js')),
			__memo(() => import('./nodes/18.js')),
			__memo(() => import('./nodes/19.js')),
			__memo(() => import('./nodes/20.js')),
			__memo(() => import('./nodes/21.js')),
			__memo(() => import('./nodes/22.js')),
			__memo(() => import('./nodes/23.js')),
			__memo(() => import('./nodes/24.js')),
			__memo(() => import('./nodes/25.js')),
			__memo(() => import('./nodes/26.js')),
			__memo(() => import('./nodes/27.js')),
			__memo(() => import('./nodes/28.js')),
			__memo(() => import('./nodes/29.js')),
			__memo(() => import('./nodes/30.js')),
			__memo(() => import('./nodes/31.js')),
			__memo(() => import('./nodes/32.js')),
			__memo(() => import('./nodes/33.js')),
			__memo(() => import('./nodes/34.js')),
			__memo(() => import('./nodes/35.js')),
			__memo(() => import('./nodes/36.js')),
			__memo(() => import('./nodes/37.js')),
			__memo(() => import('./nodes/38.js')),
			__memo(() => import('./nodes/39.js')),
			__memo(() => import('./nodes/40.js')),
			__memo(() => import('./nodes/41.js')),
			__memo(() => import('./nodes/42.js')),
			__memo(() => import('./nodes/43.js')),
			__memo(() => import('./nodes/44.js')),
			__memo(() => import('./nodes/45.js')),
			__memo(() => import('./nodes/46.js')),
			__memo(() => import('./nodes/47.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/(marketing)",
				pattern: /^\/?$/,
				params: [],
				page: { layouts: [0,5,], errors: [1,,], leaf: 35 },
				endpoint: null
			},
			{
				id: "/(admin)/account/(menu)",
				pattern: /^\/account\/?$/,
				params: [],
				page: { layouts: [0,2,3,], errors: [1,,,], leaf: 9 },
				endpoint: null
			},
			{
				id: "/(admin)/account/api",
				pattern: /^\/account\/api\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 19 },
				endpoint: null
			},
			{
				id: "/(admin)/account/(menu)/billing",
				pattern: /^\/account\/billing\/?$/,
				params: [],
				page: { layouts: [0,2,3,], errors: [1,,,], leaf: 10 },
				endpoint: null
			},
			{
				id: "/(admin)/account/(menu)/billing/manage",
				pattern: /^\/account\/billing\/manage\/?$/,
				params: [],
				page: { layouts: [0,2,3,], errors: [1,,,], leaf: 11 },
				endpoint: null
			},
			{
				id: "/(admin)/account/create_profile",
				pattern: /^\/account\/create_profile\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 20 },
				endpoint: null
			},
			{
				id: "/(admin)/account/select_plan",
				pattern: /^\/account\/select_plan\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 21 },
				endpoint: null
			},
			{
				id: "/(admin)/account/(menu)/settings",
				pattern: /^\/account\/settings\/?$/,
				params: [],
				page: { layouts: [0,2,3,], errors: [1,,,], leaf: 12 },
				endpoint: null
			},
			{
				id: "/(admin)/account/(menu)/settings/change_email_subscription",
				pattern: /^\/account\/settings\/change_email_subscription\/?$/,
				params: [],
				page: { layouts: [0,2,3,], errors: [1,,,], leaf: 14 },
				endpoint: null
			},
			{
				id: "/(admin)/account/(menu)/settings/change_email",
				pattern: /^\/account\/settings\/change_email\/?$/,
				params: [],
				page: { layouts: [0,2,3,], errors: [1,,,], leaf: 13 },
				endpoint: null
			},
			{
				id: "/(admin)/account/(menu)/settings/change_password",
				pattern: /^\/account\/settings\/change_password\/?$/,
				params: [],
				page: { layouts: [0,2,3,], errors: [1,,,], leaf: 15 },
				endpoint: null
			},
			{
				id: "/(admin)/account/(menu)/settings/delete_account",
				pattern: /^\/account\/settings\/delete_account\/?$/,
				params: [],
				page: { layouts: [0,2,3,], errors: [1,,,], leaf: 16 },
				endpoint: null
			},
			{
				id: "/(admin)/account/(menu)/settings/edit_profile",
				pattern: /^\/account\/settings\/edit_profile\/?$/,
				params: [],
				page: { layouts: [0,2,3,], errors: [1,,,], leaf: 17 },
				endpoint: null
			},
			{
				id: "/(admin)/account/(menu)/settings/reset_password",
				pattern: /^\/account\/settings\/reset_password\/?$/,
				params: [],
				page: { layouts: [0,2,3,], errors: [1,,,], leaf: 18 },
				endpoint: null
			},
			{
				id: "/(admin)/account/sign_out",
				pattern: /^\/account\/sign_out\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 22 },
				endpoint: null
			},
			{
				id: "/(admin)/account/subscribe/[slug]",
				pattern: /^\/account\/subscribe\/([^/]+?)\/?$/,
				params: [{"name":"slug","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,2,], errors: [1,,], leaf: 23 },
				endpoint: null
			},
			{
				id: "/(marketing)/auth/callback",
				pattern: /^\/auth\/callback\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/(marketing)/auth/callback/_server.js'))
			},
			{
				id: "/(marketing)/blog",
				pattern: /^\/blog\/?$/,
				params: [],
				page: { layouts: [0,5,6,], errors: [1,,,], leaf: 36 },
				endpoint: null
			},
			{
				id: "/(marketing)/blog/(posts)/awesome_post",
				pattern: /^\/blog\/awesome_post\/?$/,
				params: [],
				page: { layouts: [0,5,6,7,], errors: [1,,,,], leaf: 37 },
				endpoint: null
			},
			{
				id: "/(marketing)/blog/(posts)/example_blog_post",
				pattern: /^\/blog\/example_blog_post\/?$/,
				params: [],
				page: { layouts: [0,5,6,7,], errors: [1,,,,], leaf: 38 },
				endpoint: null
			},
			{
				id: "/(marketing)/blog/(posts)/how_we_built_our_41kb_saas_website",
				pattern: /^\/blog\/how_we_built_our_41kb_saas_website\/?$/,
				params: [],
				page: { layouts: [0,5,6,7,], errors: [1,,,,], leaf: 39 },
				endpoint: null
			},
			{
				id: "/(marketing)/blog/rss.xml",
				pattern: /^\/blog\/rss\.xml\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/(marketing)/blog/rss.xml/_server.ts.js'))
			},
			{
				id: "/(marketing)/contact_us",
				pattern: /^\/contact_us\/?$/,
				params: [],
				page: { layouts: [0,5,], errors: [1,,], leaf: 40 },
				endpoint: null
			},
			{
				id: "/(experiments)/drawing-canvas",
				pattern: /^\/drawing-canvas\/?$/,
				params: [],
				page: { layouts: [0,4,], errors: [1,,], leaf: 24 },
				endpoint: null
			},
			{
				id: "/(experiments)/fps-game",
				pattern: /^\/fps-game\/?$/,
				params: [],
				page: { layouts: [0,4,], errors: [1,,], leaf: 25 },
				endpoint: null
			},
			{
				id: "/(experiments)/light-cycles",
				pattern: /^\/light-cycles\/?$/,
				params: [],
				page: { layouts: [0,4,], errors: [1,,], leaf: 26 },
				endpoint: null
			},
			{
				id: "/(experiments)/loan-calculator",
				pattern: /^\/loan-calculator\/?$/,
				params: [],
				page: { layouts: [0,4,], errors: [1,,], leaf: 27 },
				endpoint: null
			},
			{
				id: "/(marketing)/login",
				pattern: /^\/login\/?$/,
				params: [],
				page: { layouts: [0,5,8,], errors: [1,,,], leaf: 41 },
				endpoint: null
			},
			{
				id: "/(marketing)/login/current_password_error",
				pattern: /^\/login\/current_password_error\/?$/,
				params: [],
				page: { layouts: [0,5,8,], errors: [1,,,], leaf: 42 },
				endpoint: null
			},
			{
				id: "/(marketing)/login/forgot_password",
				pattern: /^\/login\/forgot_password\/?$/,
				params: [],
				page: { layouts: [0,5,8,], errors: [1,,,], leaf: 43 },
				endpoint: null
			},
			{
				id: "/(marketing)/login/sign_in",
				pattern: /^\/login\/sign_in\/?$/,
				params: [],
				page: { layouts: [0,5,8,], errors: [1,,,], leaf: 44 },
				endpoint: null
			},
			{
				id: "/(marketing)/login/sign_up",
				pattern: /^\/login\/sign_up\/?$/,
				params: [],
				page: { layouts: [0,5,8,], errors: [1,,,], leaf: 45 },
				endpoint: null
			},
			{
				id: "/(experiments)/minesweeper",
				pattern: /^\/minesweeper\/?$/,
				params: [],
				page: { layouts: [0,4,], errors: [1,,], leaf: 28 },
				endpoint: null
			},
			{
				id: "/(experiments)/pong",
				pattern: /^\/pong\/?$/,
				params: [],
				page: { layouts: [0,4,], errors: [1,,], leaf: 29 },
				endpoint: null
			},
			{
				id: "/(marketing)/pricing",
				pattern: /^\/pricing\/?$/,
				params: [],
				page: { layouts: [0,5,], errors: [1,,], leaf: 46 },
				endpoint: null
			},
			{
				id: "/(marketing)/search",
				pattern: /^\/search\/?$/,
				params: [],
				page: { layouts: [0,5,], errors: [1,,], leaf: 47 },
				endpoint: null
			},
			{
				id: "/(marketing)/search/api.json",
				pattern: /^\/search\/api\.json\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/(marketing)/search/api.json/_server.ts.js'))
			},
			{
				id: "/(marketing)/sitemap.xml",
				pattern: /^\/sitemap\.xml\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/(marketing)/sitemap.xml/_server.ts.js'))
			},
			{
				id: "/(experiments)/space-invaders",
				pattern: /^\/space-invaders\/?$/,
				params: [],
				page: { layouts: [0,4,], errors: [1,,], leaf: 30 },
				endpoint: null
			},
			{
				id: "/(experiments)/starship-flyer",
				pattern: /^\/starship-flyer\/?$/,
				params: [],
				page: { layouts: [0,4,], errors: [1,,], leaf: 31 },
				endpoint: null
			},
			{
				id: "/(experiments)/tower-defense",
				pattern: /^\/tower-defense\/?$/,
				params: [],
				page: { layouts: [0,4,], errors: [1,,], leaf: 32 },
				endpoint: null
			},
			{
				id: "/(experiments)/world-builder",
				pattern: /^\/world-builder\/?$/,
				params: [],
				page: { layouts: [0,4,], errors: [1,,], leaf: 33 },
				endpoint: null
			},
			{
				id: "/(experiments)/worm-game",
				pattern: /^\/worm-game\/?$/,
				params: [],
				page: { layouts: [0,4,], errors: [1,,], leaf: 34 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
