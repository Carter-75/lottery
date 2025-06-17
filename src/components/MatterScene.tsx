'use client';

import React, { useEffect, useRef } from 'react';
import * as Matter from 'matter-js';

declare const anime: any;

const MatterScene: React.FC = () => {
  const sceneRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef(Matter.Engine.create());
  const renderRef = useRef<Matter.Render>();

  useEffect(() => {
    const { Render, Runner, World, Bodies } = Matter;

    const engine = engineRef.current;
    const world = engine.world;

    let render: Matter.Render;
    let runner: Matter.Runner;

    // create renderer
    render = Render.create({
      element: sceneRef.current!,
      engine: engine,
      options: {
        width: window.innerWidth,
        height: window.innerHeight,
        wireframes: false,
        background: '#282c34'
      }
    });
    renderRef.current = render;


    Render.run(render);

    // create runner
    runner = Runner.create();
    Runner.run(runner, engine);

    // add bodies
    const ground = Bodies.rectangle(window.innerWidth / 2, window.innerHeight + 30, window.innerWidth, 60, { isStatic: true, label: 'ground' });
    World.add(world, [ground]);
      
    // Add mouse control
    const mouse = Matter.Mouse.create(render.canvas);
    const mouseConstraint = Matter.MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
            stiffness: 0.2,
            render: {
                visible: false
            }
        }
    });

    World.add(world, mouseConstraint);

    // keep the mouse in sync with rendering
    render.mouse = mouse;

    // fit the render viewport to the scene
    Render.lookAt(render, {
        min: { x: 0, y: 0 },
        max: { x: window.innerWidth, y: window.innerHeight }
    });
      
    const handleResize = () => {
        if (renderRef.current) {
          const canvas = renderRef.current.canvas;
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;
  
          // update ground position and size
          const ground = world.bodies.find(body => body.label === 'ground');
          if (ground) {
            Matter.Body.setPosition(ground, { x: window.innerWidth / 2, y: window.innerHeight });
            Matter.Body.setVertices(ground, Matter.Vertices.create([{ x: 0, y: window.innerHeight }, { x: window.innerWidth, y: window.innerHeight }], ground));
          }
          
          Render.lookAt(renderRef.current, {
              min: { x: 0, y: 0 },
              max: { x: window.innerWidth, y: window.innerHeight }
          });
        }
      };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (render) {
        Render.stop(render);
        if(runner) Runner.stop(runner);
        World.clear(world, false);
        Matter.Engine.clear(engine);
        render.canvas.remove();
        render.textures = {};
      }
    };
  }, []);

  return <div ref={sceneRef} style={{ width: '100vw', height: '100vh' }} />;
};

export default MatterScene; 