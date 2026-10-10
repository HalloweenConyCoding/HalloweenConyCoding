"""Author the clock in Blender; export static parts by material, retaining movable hands.
Run: blender -b --python mainpage_version/ACTIVE/tools/build-clock.py -- OUTPUT.glb
Meshes, grain and patina are authored here; the generated dial PNG is a local input.
See assets/models/PROVENANCE.md for texture provenance. No remote dependencies.
"""
import bpy,math,sys,random
from mathutils import Vector
from pathlib import Path
random.seed(61)
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
static=[]
def material(name,color,metal=0,rough=.5):
 m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);m.use_nodes=True
 n=m.node_tree.nodes.get('Principled BSDF');n.inputs['Base Color'].default_value=(*color,1);n.inputs['Metallic'].default_value=metal;n.inputs['Roughness'].default_value=rough
 return m
gold=material('Antique gold',(.58,.34,.105),.82,.3)
edge=material('Polished engraved brass',(.8,.57,.23),.78,.27)
bronze=material('Oxidized bronze',(.16,.085,.038),.75,.52)
wood=material('Carved walnut',(.095,.038,.016),0,.48)
blue=material('Midnight enamel',(.013,.037,.055),.52,.28)
dial=material('Engraved enamel dial',(.8,.8,.8),.48,.48)
dialImage=bpy.data.images.load(str(Path(__file__).resolve().parents[1]/'assets/textures/astronomical-dial.png'));dialImage.pack()
dialNode=dial.node_tree.nodes.new('ShaderNodeTexImage');dialNode.image=dialImage;dial.node_tree.links.new(dialNode.outputs['Color'],dial.node_tree.nodes.get('Principled BSDF').inputs['Base Color'])
black=material('Mechanism recess',(.01,.014,.017),.45,.48)
# Embedded, authored grain and tarnish; glTF retains the base-color textures.
import numpy as np
for mat,iswood in [(wood,True),(bronze,False)]:
 w=512;rng=np.random.default_rng(25);yy,xx=np.mgrid[0:w,0:w];noise=rng.random((w,w));
 if iswood:
  wave=np.sin(xx*.19+np.sin(yy*.015)*6+np.sin(xx*.021)*12)*.5+.5
  factor=.48+.5*wave+.15*noise;base=np.array([.28,.13,.057])
  rgb=factor[:,:,None]*base
 else:
  factor=.7+.22*noise+.08*np.sin(xx*.023)*np.sin(yy*.041);base=np.array([.38,.245,.115]);rgb=factor[:,:,None]*base
  patina=(np.sin(xx*.027+np.sin(yy*.02)*3)+np.cos(yy*.043)+noise)>.95
  rgb[patina]*=np.array([.6,1.12,1.6])
 pixels=np.concatenate([rgb,np.ones((w,w,1))],axis=2).astype(np.float32)
 img=bpy.data.images.new(mat.name+' surface',width=w,height=w);img.pixels.foreach_set(pixels.ravel());img.pack()
 node=mat.node_tree.nodes.new('ShaderNodeTexImage');node.image=img;mat.node_tree.links.new(node.outputs['Color'],mat.node_tree.nodes.get('Principled BSDF').inputs['Base Color'])

def finish(o,mat,movable=False):
 o.data.materials.append(mat)
 if o.type=='MESH':
  for p in o.data.polygons:p.use_smooth=True
 if not movable:static.append(o)
 return o

def cube(name,loc,size,mat,bevel=.03):
 bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.name=name;o.scale=size
 bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 if bevel:
  mod=o.modifiers.new('Hand softened edges','BEVEL');mod.width=bevel;mod.segments=2
  bpy.ops.object.modifier_apply(modifier=mod.name)
 return finish(o,mat)

def torus(name,r,tube,loc,mat,rotation=(math.pi/2,0,0),segments=96):
 bpy.ops.mesh.primitive_torus_add(major_radius=r,minor_radius=tube,major_segments=segments,minor_segments=6,location=loc,rotation=rotation)
 o=bpy.context.object;o.name=name;return finish(o,mat)

def cylinder(name,r,depth,loc,mat,front=False,vertices=64):
 bpy.ops.mesh.primitive_cylinder_add(vertices=vertices,radius=r,depth=depth,location=loc,rotation=(math.pi/2,0,0) if front else (0,0,0));o=bpy.context.object;o.name=name;return finish(o,mat)

def sphere(name,r,loc,mat,scale=(1,1,1)):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=16,ring_count=8,radius=r,location=loc);o=bpy.context.object;o.name=name;o.scale=scale;return finish(o,mat)

def tube(name,points,r,mat):
 curve=bpy.data.curves.new(name,'CURVE');curve.dimensions='3D';curve.resolution_u=1;curve.bevel_depth=r;curve.bevel_resolution=1
 s=curve.splines.new('POLY');s.points.add(len(points)-1)
 for p,co in zip(s.points,points):p.co=(*co,1)
 o=bpy.data.objects.new(name,curve);bpy.context.collection.objects.link(o);bpy.context.view_layer.objects.active=o;o.select_set(True);bpy.ops.object.convert(target='MESH');o.select_set(False);return finish(o,mat)

def leaf(x,y,z,size,angle):
 # Curved, ribbed acanthus blade, with a solid curled tip and sculpted edges.
 verts=[];faces=[];rows=12
 for i in range(rows):
  t=i/(rows-1);width=math.sin(math.pi*t)**.7*size*.23*(1+.16*math.sin(t*math.pi*8))
  for side in [-1,0,1]:
   xx=side*width;zz=t*size;yy=-math.sin(t*math.pi)*size*.15-abs(side)*size*.035
   verts.append((x+xx*math.cos(angle)+zz*math.sin(angle),y+yy,z+zz*math.cos(angle)-xx*math.sin(angle)))
 for i in range(rows-1):
  for j in range(2):a=i*3+j;faces.append((a,a+1,a+4,a+3))
 data=bpy.data.meshes.new('Carved acanthus');data.from_pydata(verts,[],faces);data.update();o=bpy.data.objects.new('Carved acanthus leaf',data);bpy.context.collection.objects.link(o);finish(o,gold)
 bpy.context.view_layer.objects.active=o;mod=o.modifiers.new('Leaf relief','SOLIDIFY');mod.thickness=.025;bpy.ops.object.modifier_apply(modifier=mod.name)
 pts=[(x+t*size*math.sin(angle),y-math.sin(t*math.pi)*size*.15-.015,z+t*size*math.cos(angle)) for t in [i/14 for i in range(15)]]
 tube('Leaf central vein',pts,.011,edge)

def scroll(x,z,scale,flip=1,y=-.56):
 pts=[]
 for i in range(40):
  t=i/39*math.pi*3.1;r=scale*(1-i/45)
  pts.append((x+flip*math.cos(t)*r,y+math.sin(t*.5)*.028,z+math.sin(t)*r))
 tube('Forged acanthus scroll',pts,.04,gold)
 for j in [5,13,22]:
  xx,yy,zz=pts[j];leaf(xx,yy,zz,scale*.65,flip*(j*.12+.6))

# Blender Z-up becomes browser Y-up; front faces negative Blender Y.
# No display plinth: the complete antique housing is suspended.
foundation=list(static)
# The frame is furniture, with space around its dial, not a stone wall.
cy=5.4;radius=3.3
cylinder('Enamel astronomical face',radius,.32,(0,-.08,cy),blue,True,128)
dialVerts=[(math.sin(i*math.pi/64)*radius,-.285,cy+math.cos(i*math.pi/64)*radius) for i in range(128)]
dialMesh=bpy.data.meshes.new('Etched enamel surface');dialMesh.from_pydata(dialVerts,[],[tuple(range(127,-1,-1))]);dialMesh.update();dialUV=dialMesh.uv_layers.new()
for loop in dialMesh.loops:
 x,y,z=dialMesh.vertices[loop.vertex_index].co;dialUV.data[loop.index].uv=((x/radius+1)/2,((z-cy)/radius+1)/2)
dialObject=bpy.data.objects.new('Etched astronomical chart',dialMesh);bpy.context.collection.objects.link(dialObject);finish(dialObject,dial)
cylinder('Recessed gear chamber',1.38,.08,(0,-.27,cy),black,True,96)
for r,t,y,mat in [(3.45,.14,-.06,wood),(3.42,.045,-.23,gold),(3.31,.055,-.31,edge),(3.2,.024,-.32,gold),(2.78,.035,-.32,edge),(2.5,.022,-.34,gold),(2.25,.028,-.35,edge),(1.42,.065,-.43,edge),(1.32,.022,-.48,gold)]:torus('Concentric engraved bezel',r,t,(0,y,cy),mat)
# Raised radial ticks and screw heads.
for i in range(120):
 a=i*math.pi/60;r=3.13;length=.17 if i%10==0 else .075 if i%5==0 else .035
 o=cube('Minute index',(math.sin(a)*r,-.34,cy+math.cos(a)*r),(.012,.025,length),edge,0);o.rotation_euler.y=a
for i in range(48):
 a=i*math.pi/24;sphere('Bezel rivet',.023,(math.sin(a)*3.36,-.32,cy+math.cos(a)*3.36),edge)
fontpath='/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf'
font=bpy.data.fonts.load(fontpath) if Path(fontpath).exists() else None
# Ecliptic lattice, constellations, and decorative sun medallions.
for r in [1.72,1.98,2.12]:torus('Celestial latitude',r,.008,(0,-.37,cy),gold)
for i in range(24):
 a=i*math.pi/12;tube('Celestial longitude',[(math.sin(a)*1.43,-.38,cy+math.cos(a)*1.43),(math.sin(a)*2.24,-.38,cy+math.cos(a)*2.24)],.009,gold)
for i in range(12):
 a=(i+.5)*math.pi/6;x=math.sin(a)*2.61;z=cy+math.cos(a)*2.61
 torus('Zodiac seal',.087,.012,(x,-.38,z),gold,segments=20)
 for j in range(8):
  b=j*math.pi/4;tube('Star ray',[(x+math.sin(b)*.11,-.38,z+math.cos(b)*.11),(x+math.sin(b)*.17,-.38,z+math.cos(b)*.17)],.008,edge)
# Tooth profiles are single meshes, with open spokes and real recesses.
for k,(x,z,r,n) in enumerate([(-.55,5.9,.55,30),(.52,5.84,.51,28),(0,4.9,.65,36),(-.9,5.1,.28,18),(.83,5.0,.36,22),(0,5.45,.29,18)]):
 torus('Mechanism wheel',r*.85,.042,(x,-.47,z),bronze,segments=48)
 for i in range(n):
  a=i*math.pi*2/n;o=cube('Gear tooth',(x+math.sin(a)*r,-.48,z+math.cos(a)*r),(.075,.09,.07),gold,.008);o.rotation_euler.y=a
 for i in range(6):
  a=i*math.pi/3;tube('Wheel spoke',[(x,-.5,z),(x+math.sin(a)*r*.86,-.5,z+math.cos(a)*r*.86)],.018,edge)
 cylinder('Wheel arbor',.08,.15,(x,-.51,z),edge,True,16)
# Ornamental carved frame, turned pillars, and finials.
for sign in [-1,1]:
 x=sign*3.63
 cylinder('Turned walnut pillar',.22,6.8,(x,0,4.65),wood,vertices=32)
 for z in [1.3,1.45,1.75,2,3.3,6.6,7.9,8,8.2]:
  cylinder('Pillar collar',.31 if z in [1.3,8.2] else .255,.08,(x,0,z),gold,vertices=32)
 for i in range(8):
  a=i*math.pi/4;tube('Pillar fluting',[(x+math.cos(a)*.225,math.sin(a)*.225,2.05),(x+math.cos(a)*.225,math.sin(a)*.225,7.85)],.012,edge)
 sphere('Pillar finial',.27,(x,0,8.7),bronze);cylinder('Finial stem',.06,.5,(x,0,8.4),gold,vertices=16)
 for z,sz in [(1.65,.48),(2.2,.4),(7.95,.45),(8.3,.3)]:scroll(x,z,sz,sign)
 for i in range(5):
  a=(i+.5)*math.pi/10;xx=sign*math.sin(a)*3.8;zz=cy+math.cos(a)*3.8;scroll(xx,zz,.17,sign,y=-.22)
# Crown: linked scrolls and acanthus leaves.
for sign in [-1,1]:
 for x,z,scale in [(2.7,8.4,.55),(1.8,9.15,.5)]:scroll(sign*x,z,scale,sign,y=-.25)
 tube('Crown arch',[(sign*(3.3-i*.082),-.12,8.15+math.sin(i/40*math.pi/2)*1.8) for i in range(41)],.065,bronze)
for i in range(7):
 x=(i-3)*.57;z=9.6-abs(x)*.2;leaf(x,-.22,z,.75,x*.3)
sphere('Crown celestial orb',.22,(0,-.02,10.35),blue);torus('Crown orb ring',.26,.018,(0,-.03,10.35),edge)
cylinder('Crown spire',.027,.48,(0,0,10.65),edge,vertices=12)
# Pendant below the dial.
cube('Pendulum recess',(0,0,1.6),(1.9,.35,1.3),black,.06)
cube('Pendulum stem',(0,-.26,1.8),(.045,.04,1.3),edge,.008)
sphere('Pendulum bob',.27,(0,-.29,1.25),gold,(1,.25,1))
for x in [-.88,-.55,.55,.88]:cube('Lower grille',(x,-.25,1.65),(.04,.04,1.14),bronze,.008)
# Lower support stays quiet; no decorative curls on the foundation.
# Hands stay separate and their origin is the dial spindle.
for name,length,angle in [('MinuteHand',2.5,-.72),('HourHand',1.65,.8)]:
 points=[(0,0,-.42),(-.12,0,-.2),(-.055,0,.15),(-.035,0,length-.38),(-.12,0,length-.5),(0,0,length),(.12,0,length-.5),(.035,0,length-.38),(.055,0,.15),(.12,0,-.2)]
 verts=[(x,y+dy,z) for dy in [-.035,.035] for x,y,z in points];n=len(points);faces=[tuple(range(n-1,-1,-1)),tuple(range(n,2*n))]+[(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)]
 data=bpy.data.meshes.new(name);data.from_pydata(verts,[],faces);data.update();o=bpy.data.objects.new(name,data);bpy.context.collection.objects.link(o);o.location=(0,-.7,cy);o.rotation_euler.y=angle;finish(o,edge,True)
sphere('Spindle jewel',.13,(0,-.78,cy),gold)
for obj in list(bpy.context.scene.objects):
 if obj not in foundation:obj.location.z-=.6
# Join static geometry by material to keep browser draw calls bounded.
groups={mat:[o for o in static if o.data.materials[0]==mat] for mat in [gold,edge,bronze,wood,blue,black,dial]}
for mat,objects in groups.items():
 bpy.ops.object.select_all(action='DESELECT')
 for o in objects:o.select_set(True)
 if objects:
  bpy.context.view_layer.objects.active=objects[0];bpy.ops.object.join();bpy.context.object.name='Clock_'+mat.name.replace(' ','_')
out=Path(sys.argv[sys.argv.index('--')+1]);out.parent.mkdir(parents=True,exist_ok=True)
bpy.ops.export_scene.gltf(filepath=str(out),export_format='GLB',export_yup=True,export_materials='EXPORT',export_texcoords=True,export_normals=True,export_animations=False)
print('Exported authored astronomical clock:',out)
