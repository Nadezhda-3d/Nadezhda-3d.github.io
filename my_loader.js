let SCENE;
let CAMERA;
let RENDERER;
let LoadingManager;
let ImageLoader;
let OBJ_LOADER;
let CONTROLS;
let floormesh;
let TEXTURE;
let CTX_CANVAS;
let op;
const containerName = "canvas-container";
let viewerContainer;
let Material;

let panel = {
    "model": {},
    "materialsArray": [],
    "texture":{},
    "textureCanvas": Object.create(CanvasRenderingContext2D.prototype),
    "imagesArray": new Map(),

}
function initViewer(){
    
    viewerContainer = document.getElementsByClassName(containerName)[0];

    console.log(viewerContainer);
    RENDERER = new THREE.WebGLRenderer({ alpha: false });
    RENDERER.setPixelRatio(window.devicePixelRatio);
    RENDERER.setSize(window.innerWidth*0.8, window.innerHeight);
    
    viewerContainer.appendChild(RENDERER.domElement);

    initScene();
    initCamera();
    initLights();
    initLoaders();
    initControls();
    addCliker();
}

function initScene() {
    SCENE = new THREE.Scene();

}

function initLights() {
    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    SCENE.add(ambient);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9);
    directionalLight.position.set( 0, 0, 350 );
	directionalLight.lookAt(new THREE.Vector3(0,0,0));
    SCENE.add(directionalLight);
}

function initCamera() {
    CAMERA = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 10000);
    
    CAMERA.position.set(0,0,500);
    SCENE.add(CAMERA);
}
function initLoaders() {
    LoadingManager = new THREE.LoadingManager();
    ImageLoader = new THREE.ImageLoader(LoadingManager);
    OBJ_LOADER = new THREE.OBJLoader(LoadingManager);
    MTL_LOADER = new THREE.MTLLoader(LoadingManager);
    textureLoader = new THREE.TextureLoader(LoadingManager);
}
function initControls() {
    CONTROLS = new THREE.OrbitControls(CAMERA, RENDERER.domElement);
    CONTROLS.target.set(0, 5, -2000);
    CONTROLS.update();
}

function addCliker(count){
    
    for(let i=0; i<count; i++) {
        viewerContainer.insertAdjacentHTML("afterbegin", 
                `<input type="range" min="0" max="1" step="0.01" value="1" class="rangeOpacity" user_depth="${i+1}"
                    style="position: absolute; top: ${(count-i)*5}%; left: 0%; z-index:5"></input>`);
    }
    let levels = viewerContainer.getElementsByClassName("rangeOpacity");
    for(let lev of levels){
        lev.addEventListener('input',changeTrans);
    }
    
}

function changeTrans(event){
    console.log(event);
    console.log(event.target.value);
    let currentDepth = event.target.getAttribute("user_depth");
    console.log("User depth = " + event.target.getAttribute("user_depth"));

    for(let image of panel.imagesArray.values()){
        console.log(image);
        if(image.depth != currentDepth){
            panel.textureCanvas.globalAlpha = image.opacity;               
        }
        else{
            image.opacity = event.target.value;
            panel.textureCanvas.globalAlpha = event.target.value;
        }
        panel.textureCanvas.drawImage(image.img, 0, 0); 
    }
    
	panel.texture.needsUpdate = true;
	
	return "ok";
}

function initCanvasBase(){
    let html_canvas = document.createElement('canvas');
    panel.textureCanvas = document.createElement('canvas').getContext('2d');
    html_canvas.width = 4096;
    html_canvas.height = 4096;
    panel.textureCanvas.canvas.width = 4096;
    panel.textureCanvas.canvas.height = 4096;
    
}

function loadTexture() {

    ImageLoader.load('./models/A5_gal.jpg', function (image) {  
       
        img = image; panel.textureCanvas.drawImage(img, 0,0, 4096, 4096);  
        panel.imagesArray.set(2,
            {
                "name":"base",
                "img": image,
                "depth": 1,
                "opacity": 1
            });         
    });

    ImageLoader.load('./models/A5_yrd_gal.jpg', image => {
       
        img2 = image; panel.textureCanvas.drawImage(img2, 0, 0, 4096, 4096);
        panel.imagesArray.set(1,{
            "name":"drawing",
            "img": image,
            "depth": 2,
            "opacity": 1
        });
    });
    addCliker(2);
    panel.texture = new THREE.CanvasTexture(panel.textureCanvas.canvas);
        /*THREE.UVMapping,
        THREE.ClampToEdgeWrapping,
        THREE.LinearFilter,
        THREE.LinearMipMapLinearFilter,
        THREE.RGBAFormat);*/
    panel.texture.needsUpdate = true;  
    return panel.texture;
}

function loadModel() {

    Material = new THREE.MeshLambertMaterial({
        flatShading : THREE.SmoothShading,
    });
    initCanvasBase();

    panel.materialsArray = [Material];
    Material.map = loadTexture();
    Material.needsUpdate = true;
    
    OBJ_LOADER.load('./models/A5_gal.obj', (object) => {

        object.traverse( function (node) {
            if(node.type == 'Mesh') {

                node.position.z = -2000;
                node.material = Material;
                console.log("Mesh: ");
                console.log(node);
                panel.model = node;
                SCENE.add(panel.model);
            }
        });
    
    });
    
}

let animate = function () {
    requestAnimationFrame( animate );

    RENDERER.render(SCENE, CAMERA);
};

initViewer();
loadModel();
animate();

