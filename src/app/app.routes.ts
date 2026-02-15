import { Routes } from '@angular/router';
import { SceneCanvas } from './components/scene-canvas/scene-canvas';
import { Landing } from './components/landing/landing';
import { Brain } from './components/brain/brain';
import { ThreeScene } from './components/three-scene/three-scene';
import { Github } from './services/github';

import { Main } from './components/main/main';
import { ThreeD } from './components/three-d/three-d';

export const routes: Routes = [
    {
        path:'',component:Main
    },{
        path:'3d',component:ThreeD
    }
    
];
