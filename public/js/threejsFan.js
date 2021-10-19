    var scene, 
    camera,
    controls,
    fieldOfView,
    aspectRatio,
    nearPlane,
    farPlane,
    shadowLight, 
    backLight,
    light, 
    renderer,
        container;

//SCENE
var floor, fan,
    isBlowing = false;
if($('#switch').is(":checked"))
{
    isBlowing = true;
}
//SCREEN VARIABLES
var HEIGHT,
    WIDTH,
    windowHalfX,
    windowHalfY,
    mousePos = {x:0,y:0};
    dist = 0;

//INIT THREE JS, SCREEN AND MOUSE EVENTS

function init(){
scene = new THREE.Scene();
HEIGHT = window.innerHeight;
WIDTH = window.innerWidth;
aspectRatio = WIDTH / HEIGHT;
fieldOfView = 100;
nearPlane = 10;
farPlane = 1000;  
camera = new THREE.PerspectiveCamera(
    fieldOfView,
    aspectRatio,
    nearPlane,
    farPlane);
camera.position.y = 350;
camera.position.x = -50;
camera.position.z = 230;
camera.lookAt(new THREE.Vector3(0,0,0));    
renderer = new THREE.WebGLRenderer({alpha: true, antialias: true });
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize(WIDTH, HEIGHT);
renderer.shadowMap.enabled = true;
container = document.getElementById('world');
container.appendChild(renderer.domElement);
windowHalfX = WIDTH / 2;
windowHalfY = HEIGHT / 2;
window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
    HEIGHT = window.innerHeight;
    WIDTH = window.innerWidth;
    windowHalfX = WIDTH / 2;
    windowHalfY = HEIGHT / 2;
    renderer.setSize(WIDTH, HEIGHT);
    camera.aspect = WIDTH / HEIGHT;
    camera.updateProjectionMatrix();
}

function createLights() {
    light = new THREE.HemisphereLight(0xffffff, 0xffffff, .5)
    
    shadowLight = new THREE.DirectionalLight(0xffffff, .8);
    shadowLight.position.set(200, 200, 200);
    shadowLight.castShadow = true;
    shadowLight.shadowDarkness = .2;
        
    backLight = new THREE.DirectionalLight(0xffffff, .4);
    backLight.position.set(-100, 200, 50);
    backLight.shadowDarkness = .1;
    backLight.castShadow = true;
        
    scene.add(backLight);
    scene.add(light);
    scene.add(shadowLight);
}

function createFloor(){ 
    floor = new THREE.Mesh(new THREE.PlaneBufferGeometry(1000,500), new THREE.MeshBasicMaterial({color: 0xebe5e7}));
    floor.rotation.x = -Math.PI/2;
    floor.position.y = -100;
    floor.receiveShadow = true;
    scene.add(floor);
}

function createFan(){
    fan = new Fan();
    fan.threegroup.position.z = 100;
    fan.threegroup.position.y = 50;
    scene.add(fan.threegroup);
}

Fan = function(){
    this.isBlowing = false;
    this.speed = 0;
    this.acc =0;
    this.redMat = new THREE.MeshLambertMaterial ({
        color: 0xad3525, 
        shading:THREE.FlatShading
    });
    this.greyMat = new THREE.MeshLambertMaterial ({
        color: 0x653f4c, 
        shading:THREE.FlatShading
    });
    
    this.yellowMat = new THREE.MeshLambertMaterial ({
        color: 0xfdd276, 
        shading:THREE.FlatShading
    });
    
    var coreGeom = new THREE.BoxGeometry(10,10,20);
    var sphereGeom = new THREE.BoxGeometry(10, 10, 3);
    var propGeom = new THREE.BoxGeometry(10,30,2);
    propGeom.applyMatrix4( new THREE.Matrix4().makeTranslation( 0,25,0) );
    
    this.core = new THREE.Mesh(coreGeom,this.greyMat);
    
    // propellers
    var prop1 = new THREE.Mesh(propGeom, this.redMat);
    prop1.position.z = 15;
    var prop2 = prop1.clone();
    prop2.rotation.z = Math.PI/2;
    var prop3 = prop1.clone();
    prop3.rotation.z = Math.PI;
    var prop4 = prop1.clone();
    prop4.rotation.z = -Math.PI/2;
    
    this.sphere = new THREE.Mesh(sphereGeom, this.yellowMat);
    this.sphere.position.z = 15;
    
    this.propeller = new THREE.Group();
    this.propeller.add(prop1);
    this.propeller.add(prop2);
    this.propeller.add(prop3);
    this.propeller.add(prop4);
    
    this.threegroup = new THREE.Group();
    this.threegroup.add(this.core);
    this.threegroup.add(this.propeller);
    this.threegroup.add(this.sphere);
}

Fan.prototype.update = function(xTarget, yTarget){
    this.threegroup.lookAt(new THREE.Vector3(0,80,60));
    this.tPosX = rule3(xTarget, -200, 200, -250, 250);
    this.tPosY = rule3(yTarget, -200, 200, 250, -250);

    this.threegroup.position.x += (this.tPosX - this.threegroup.position.x) /10;
    this.threegroup.position.y += (this.tPosY - this.threegroup.position.y) /10;
    
    this.targetSpeed = (this.isBlowing) ? .3 : .01;
    if (this.isBlowing && this.speed < .5){
        this.acc +=.001;
        this.speed += this.acc;
    }else if (!this.isBlowing){
        this.acc = 0;
        this.speed *= .98;
    }
    this.propeller.rotation.z += this.speed; 
}
function loop(){
    render();
    var xTarget = (mousePos.x- windowHalfX);
    var yTarget= (mousePos.y-windowHalfY);
    
    fan.isBlowing = isBlowing;
    fan.update(xTarget, yTarget);
    requestAnimationFrame(loop);
    }

    function render(){
    if (controls) controls.update();
    renderer.render(scene, camera);
}


init();
createLights();
createFloor();
createFan();
loop();


function clamp(v,min, max){
    return Math.min(Math.max(v, min), max);
}

function rule3(v,vmin,vmax,tmin, tmax){
    var nv = Math.max(Math.min(v,vmax), vmin);
    var dv = vmax-vmin;
    var pc = (nv-vmin)/dv;
    var dt = tmax-tmin;
    var tv = tmin + (pc*dt);
    return tv; 
}