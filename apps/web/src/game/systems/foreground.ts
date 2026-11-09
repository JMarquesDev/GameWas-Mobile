import Phaser from 'phaser';
import { sceneSize } from '../backgrounds';

type Layer = { name: string; depth: number; points: [number, number][] };
// Silhouettes in source-image pixels. Reuse original pixels; never repaint the art.
// Depth is the ground-contact line in the navigation coordinate system (960Ã—540).
const layers: Record<string, Layer[]> = {
  infancia: [
    { name: 'bed-front', depth: 454, points: [[209,482],[208,475],[212,468],[218,466],[225,469],[230,476],[230,484],[426,480],[426,471],[431,464],[439,462],[446,465],[453,473],[453,604],[449,611],[434,613],[426,609],[426,592],[230,595],[230,607],[225,613],[213,612],[208,605]] },
    { name: 'backpack', depth: 372, points: [[1180,515],[1190,491],[1205,480],[1225,475],[1243,478],[1255,486],[1270,490],[1284,500],[1295,515],[1293,540],[1280,551],[1265,558],[1252,569],[1235,573],[1217,568],[1200,557],[1188,545],[1182,532]] },
  ],
  'cenario-05': [
    { name: 'island', depth: 497, points: [[682,382],[732,353],[1204,353],[1254,381],[1254,402],[1241,403],[1241,609],[1236,614],[1210,613],[1209,589],[728,589],[727,613],[696,614],[695,403],[682,402]] },
    { name: 'left-stool', depth: 503, points: [[801,458],[804,449],[817,442],[842,438],[877,439],[904,445],[914,453],[914,466],[904,475],[927,612],[923,619],[914,619],[893,494],[823,494],[800,614],[793,618],[788,613],[810,476],[803,471]] },
    { name: 'right-stool', depth: 503, points: [[1001,456],[1006,447],[1024,441],[1054,439],[1087,442],[1109,449],[1117,456],[1116,469],[1108,475],[1131,612],[1127,619],[1117,617],[1096,495],[1024,495],[1002,614],[996,618],[989,613],[1010,476],[1003,470]] },
  ],
  'cenario-06': [
    { name: 'workbench', depth: 441, points: [[582,562],[657,481],[1185,481],[1250,561],[1251,580],[1234,582],[1228,670],[1222,676],[612,676],[606,669],[602,581],[581,580]] },
    { name: 'chair', depth: 414, points: [[290,439],[293,425],[304,418],[329,415],[344,419],[350,431],[349,449],[338,457],[313,459],[316,483],[334,484],[358,479],[387,482],[407,492],[413,504],[410,516],[390,524],[365,527],[366,575],[405,584],[428,598],[431,610],[424,615],[413,608],[409,599],[368,590],[395,615],[395,625],[388,631],[379,627],[378,617],[359,598],[328,615],[326,630],[316,636],[307,631],[305,622],[311,612],[333,591],[303,596],[299,610],[290,615],[284,609],[285,599],[295,588],[345,575],[345,525],[324,523],[306,516],[298,505],[301,494],[309,489],[306,460],[296,454]] },
    { name: 'bin', depth: 394, points: [[1256,528],[1260,518],[1269,516],[1271,508],[1282,506],[1290,502],[1301,505],[1309,501],[1320,507],[1325,513],[1335,516],[1342,528],[1333,581],[1325,596],[1314,602],[1284,601],[1273,595],[1267,582]] },
  ],
};

export function addForeground(scene: Phaser.Scene, sceneKey: string, sourceKey: string) {
  const height = sceneSize(sceneKey).height;
  const source = scene.textures.get(sourceKey).getSourceImage() as HTMLImageElement;
  for (const layer of layers[sceneKey] ?? []) {
    const key = `foreground-20261028-v2-${sceneKey}-${layer.name}`;
    if (!scene.textures.exists(key)) {
      const texture = scene.textures.createCanvas(key, source.width, source.height);
      if (!texture) continue;
      const context = texture.context;
      context.save(); context.beginPath();
      layer.points.forEach(([x, y], i) => i ? context.lineTo(x, y) : context.moveTo(x, y));
      context.closePath(); context.clip(); context.drawImage(source, 0, 0); context.restore(); texture.refresh();
    }
    scene.add.image(480, height / 2, key).setDisplaySize(960, height).setDepth(layer.depth);
  }
}
