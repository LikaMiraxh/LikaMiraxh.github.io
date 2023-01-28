import * as THREE from './libs/three/three.module.js';
import { OrbitControls } from './libs/three/jsm/OrbitControls.js';
import { ARButton } from './libs/ARButton.js';

class App{
	constructor(){
		const container = document.createElement( 'div' );
		document.body.appendChild( container );
        
		this.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 20 );
		
		this.scene = new THREE.Scene();
       
		this.scene.add( new THREE.HemisphereLight( 0x606060, 0x404040 ) );

        const light = new THREE.DirectionalLight( 0xffffff );
        light.position.set( 1, 1, 1 ).normalize();
		this.scene.add( light );
			
		this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true } );
		this.renderer.setPixelRatio( window.devicePixelRatio ); // the rendered object will be displayed at the correct resolution on the device, regardless of the device's pixel density
		this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        
		container.appendChild( this.renderer.domElement );
        
        this.controls = new OrbitControls( this.camera, this.renderer.domElement );
        this.controls.target.set(0, 3.5, 0); // the point in 3D space that the camera will always point towards
        this.controls.update();
        
        this.initScene();
        this.setupVR();
        
        window.addEventListener('resize', this.resize.bind(this) );
	}	
    
    initScene(){
        this.geometry = new THREE.BoxBufferGeometry( 0.06, 0.06, 0.06 ); 
        this.meshes = [];
    }
    
    setupVR(){
        this.renderer.xr.enabled = true; //enabling VR/AR
        
        const self = this;
        let controller; // in this case controller is the screen of the phone itself
        
        function onSelect() {
            const material = new THREE.MeshPhongMaterial( { color: 0xffffff * Math.random() } );
            const mesh = new THREE.Mesh( self.geometry, material );
            mesh.position.set( 0, 0, - 0.3 ).applyMatrix4( controller.matrixWorld ); // the position of the mesh will be relative to the position of the controller in the agumented world
            mesh.quaternion.setFromRotationMatrix( controller.matrixWorld ); // the quaternion of the mesh is set to match the rotation of the controller
            self.scene.add( mesh );
            self.meshes.push( mesh );

        }

        const btn = new ARButton( this.renderer );
        
        controller = this.renderer.xr.getController( 0 ); // gets the first controller that is connected to the WebXR system (mobile phone)
        controller.addEventListener( 'select', onSelect ); // listens for select event which is triggered when the user clicks on the screen, then the function onSelect is called
        this.scene.add( controller );
        
        this.renderer.setAnimationLoop( this.render.bind(this) );
    }
    
    resize(){
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize( window.innerWidth, window.innerHeight );  
    }
    
	render() {   
        this.meshes.forEach( (mesh) => { mesh.rotateY( 0.01 ); });
        this.renderer.render( this.scene, this.camera );
    }
}

export { App };