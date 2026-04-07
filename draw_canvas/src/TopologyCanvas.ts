import paperImport from 'paper';

const paper = (paperImport as unknown as { default?: typeof import('paper') }).default
  ?? (paperImport as unknown as typeof import('paper'));

/**
 * TopologyCanvas - Core engine for the Topological Sandbox.
 * Manages Paper.js project, manifold sculpting, genus detection, and morphing.
 */
export class TopologyCanvas {
  canvas: HTMLCanvasElement;
  scope: paper.PaperScope;
  tool: paper.Tool | null;
  currentTool: 'brush' | 'cutter';
  isDrawing: boolean;
  isMorphing: boolean;
  lastPoint: paper.Point | null;
  brushPoints: paper.Point[];
  shouldCloseBrushLoop: boolean;
  dragFrameCount: number;
  
  manifold: paper.PathItem | null;
  strokeBuffer: paper.PathItem | null;
  brushPreviewPath: paper.Path | null;
  previewCircle: paper.Path.Circle | null;
  cutCursor: paper.Group | null;
  cutLine: paper.Path | null;
  
  brushRadius: number;
  cutRadius: number;
  genus: number;
  islandCount: number;
  
  onGenusChange: ((genus: number, islands: number) => void) | null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    
    this.tool = null;
    this.currentTool = 'brush'; // 'brush' or 'cutter'
    this.isDrawing = false;
    this.isMorphing = false;
    this.lastPoint = null;
    this.brushPoints = [];
    this.shouldCloseBrushLoop = false;
    this.dragFrameCount = 0;
    
    this.manifold = null;
    this.strokeBuffer = null;
    this.brushPreviewPath = null;
    this.previewCircle = null;
    this.cutCursor = null;
    this.cutLine = null;
    
    this.brushRadius = 25;
    this.cutRadius = 14;
    this.genus = 0;
    this.islandCount = 0;
    
    this.onGenusChange = null;
    
    this.scope = new paper.PaperScope();
    this.scope.activate();
    this.init();
  }

  init() {
    // Create a new Paper project on the canvas
    this.scope.setup(this.canvas);
    
    // Set up preview circle
    this.previewCircle = new this.scope.Path.Circle({
      center: [-100, -100],
      radius: this.brushRadius,
      strokeColor: new this.scope.Color('#64daff'),
      strokeWidth: 1.5,
      dashArray: [4, 4],
      visible: false
    });

    const cutRing = new this.scope.Path.Circle({
      center: [-100, -100],
      radius: this.cutRadius,
      strokeColor: new this.scope.Color('#f43f5e'),
      strokeWidth: 1.5,
      dashArray: [5, 4],
    });
    const cutSlashA = new this.scope.Path.Line({
      from: [-100 - this.cutRadius * 0.6, -100 - this.cutRadius * 0.6],
      to: [-100 + this.cutRadius * 0.6, -100 + this.cutRadius * 0.6],
      strokeColor: new this.scope.Color('#f43f5e'),
      strokeWidth: 2,
      strokeCap: 'round',
    });
    const cutSlashB = new this.scope.Path.Line({
      from: [-100 - this.cutRadius * 0.6, -100 + this.cutRadius * 0.6],
      to: [-100 + this.cutRadius * 0.6, -100 - this.cutRadius * 0.6],
      strokeColor: new this.scope.Color('#f43f5e'),
      strokeWidth: 2,
      strokeCap: 'round',
    });
    this.cutCursor = new this.scope.Group([cutRing, cutSlashA, cutSlashB]);
    this.cutCursor.visible = false;
    
    this.setupEventHandlers();
    this.handleResize();
    
    // Initial genus update
    this.updateGenus();
  }

  private updateCursorPreviewStyle(point?: paper.Point) {
    if (!this.previewCircle || !this.cutCursor) {
      return;
    }

    if (this.currentTool === 'brush') {
      if (point) {
        this.previewCircle.position = point;
      }
      this.previewCircle.radius = this.brushRadius;
      this.previewCircle.strokeColor = new this.scope.Color('#64daff');
      this.previewCircle.strokeWidth = 1.5;
      this.previewCircle.dashArray = [4, 4];
      this.previewCircle.visible = !this.isMorphing;
      this.cutCursor.visible = false;
    } else {
      if (point) {
        this.cutCursor.position = point;
      }
      this.previewCircle.visible = false;
      this.cutCursor.visible = !this.isMorphing;
    }
  }

  setupEventHandlers() {
    const tool = new this.scope.Tool();
    tool.minDistance = 2;
    tool.maxDistance = 10;
    this.tool = tool;
    
    tool.onMouseMove = (event: paper.ToolEvent) => {
      this.updateCursorPreviewStyle(event.point);
    };
    
    tool.onMouseDown = (event: paper.ToolEvent) => this.onMouseDown(event);
    tool.onMouseDrag = (event: paper.ToolEvent) => this.onMouseDrag(event);
    tool.onMouseUp = (event: paper.ToolEvent) => this.onMouseUp(event);
    
    window.addEventListener('resize', () => this.handleResize());
  }

  handleResize() {
    if (this.canvas && this.scope && this.scope.view) {
      const parent = this.canvas.parentElement;
      if (parent) {
        this.scope.view.viewSize = new this.scope.Size(parent.clientWidth, parent.clientHeight);
      }
    }
  }

  setTool(tool: 'brush' | 'cutter') {
    this.currentTool = tool;
    const currentPoint = this.previewCircle?.position ?? new this.scope.Point(-100, -100);
    this.updateCursorPreviewStyle(currentPoint);
  }

  styleManifold(item: paper.PathItem | null) {
    if (!item) return;
    item.fillColor = new this.scope.Color('rgba(100, 218, 255, 0.4)');
    item.strokeColor = new this.scope.Color('#64daff');
    item.strokeWidth = 2;
    item.strokeCap = 'round';
    item.strokeJoin = 'round';
    (item as any).fillRule = 'nonzero';
    
    // Add subtle neon glow
    item.shadowColor = new this.scope.Color('#64daff');
    item.shadowBlur = 8;
  }

  private clearPreview() {
    if (this.brushPreviewPath) {
      this.brushPreviewPath.remove();
      this.brushPreviewPath = null;
    }
  }

  private getActiveGeometry(): paper.PathItem | null {
    return this.manifold;
  }

  private updateBrushPreview() {
    if (!this.brushPreviewPath) {
      return;
    }

    this.brushPreviewPath.strokeColor = new this.scope.Color('rgba(100, 218, 255, 0.85)');
    this.brushPreviewPath.strokeWidth = this.brushRadius * 2;
    this.brushPreviewPath.strokeCap = 'round';
    this.brushPreviewPath.strokeJoin = 'round';
    this.brushPreviewPath.visible = true;
  }

  createPill(from: paper.Point, to: paper.Point, radius: number) {
    const vector = to.subtract(from);
    const distance = vector.length;
    
    if (distance < 1) {
      return new this.scope.Path.Circle({
        center: from,
        radius: radius
      });
    }

    const rect = new this.scope.Path.Rectangle({
      point: [from.x, from.y - radius],
      size: [distance, radius * 2]
    });
    
    rect.rotate(vector.angle, from);
    
    const circle1 = new this.scope.Path.Circle({
      center: from,
      radius: radius
    });
    
    const circle2 = new this.scope.Path.Circle({
      center: to,
      radius: radius
    });
    
    const pill = rect.unite(circle1).unite(circle2);
    rect.remove();
    circle1.remove();
    circle2.remove();
    
    return pill;
  }

  private normalizePathItem(item: paper.PathItem | null) {
    if (!item) {
      return null;
    }

    const reduced = (item.reduce({ insert: false }) as paper.PathItem | null) ?? item;
    (reduced as any).reorient?.(true);
    return reduced;
  }

  private reducePathItems(items: paper.PathItem[]) {
    if (items.length === 0) {
      return null;
    }

    let working = items.slice();

    while (working.length > 1) {
      const nextRound: paper.PathItem[] = [];

      for (let i = 0; i < working.length; i += 4) {
        const chunk = working.slice(i, i + 4);
        let merged = chunk[0];

        for (let j = 1; j < chunk.length; j++) {
          const prev = merged;
          merged = prev.unite(chunk[j]);
          prev.remove();
          chunk[j].remove();
        }

        nextRound.push(this.normalizePathItem(merged) ?? merged);
      }

      working = nextRound;
    }

    return this.normalizePathItem(working[0]) ?? working[0];
  }

  private sanitizeBrushPoints(points: paper.Point[]) {
    if (points.length <= 2) {
      return points.map((point) => point.clone());
    }

    const minSpacing = Math.max(2, this.brushRadius * 0.22);
    const cleaned: paper.Point[] = [points[0].clone()];

    for (let i = 1; i < points.length - 1; i++) {
      const point = points[i];
      const previousKept = cleaned[cleaned.length - 1];

      if (previousKept.getDistance(point) < minSpacing) {
        continue;
      }

      const nextPoint = points[i + 1];
      const incoming = point.subtract(previousKept);
      const outgoing = nextPoint.subtract(point);

      if (incoming.length < 0.001 || outgoing.length < 0.001) {
        continue;
      }

      cleaned.push(point.clone());
    }

    const lastPoint = points[points.length - 1];
    if (cleaned[cleaned.length - 1].getDistance(lastPoint) >= 0.5) {
      cleaned.push(lastPoint.clone());
    }

    return cleaned;
  }

  private sanitizeCutPoints(points: paper.Point[]) {
    if (points.length <= 2) {
      return points.map((point) => point.clone());
    }

    const minSpacing = Math.max(1, this.cutRadius * 0.12);
    const cleaned: paper.Point[] = [points[0].clone()];

    for (let i = 1; i < points.length; i++) {
      const point = points[i];
      if (cleaned[cleaned.length - 1].getDistance(point) >= minSpacing) {
        cleaned.push(point.clone());
      }
    }

    return cleaned;
  }

  private mergeStrokeIntoManifold(stroke: paper.PathItem | null) {
    if (!stroke) {
      return;
    }

    const normalizedStroke = this.normalizePathItem(stroke);
    if (!normalizedStroke) {
      return;
    }

    if (!this.manifold) {
      this.manifold = normalizedStroke;
    } else {
      const previousManifold = this.manifold;
      const merged = this.normalizePathItem(previousManifold.unite(normalizedStroke));
      previousManifold.remove();
      normalizedStroke.remove();
      this.manifold = merged;
    }

    this.styleManifold(this.manifold);
  }

  private buildTubeFromPoints(points: paper.Point[], radius: number, closeLoop: boolean = false) {
    const workingPoints = this.sanitizeBrushPoints(points);
    return this.buildTubeFromPreparedPoints(workingPoints, radius, closeLoop);
  }

  private buildCutTubeFromPoints(points: paper.Point[], radius: number) {
    const workingPoints = this.sanitizeCutPoints(points);
    return this.buildTubeFromPreparedPoints(workingPoints, radius, false);
  }

  private buildTubeFromPreparedPoints(workingPoints: paper.Point[], radius: number, closeLoop: boolean = false) {

    if (workingPoints.length === 0) {
      return null;
    }

    const primitives: paper.PathItem[] = [];

    if (workingPoints.length === 1) {
      primitives.push(new this.scope.Path.Circle({
        center: workingPoints[0],
        radius,
      }));
      return this.reducePathItems(primitives);
    }

    primitives.push(new this.scope.Path.Circle({
      center: workingPoints[0],
      radius,
    }));

    for (let index = 1; index < workingPoints.length; index++) {
      const point = workingPoints[index];
      primitives.push(this.createPill(workingPoints[index - 1], point, radius));
    }

    if (!closeLoop && workingPoints.length > 1) {
      primitives.push(new this.scope.Path.Circle({
        center: workingPoints[workingPoints.length - 1],
        radius,
      }));
    }

    if (closeLoop && workingPoints.length > 2) {
      primitives.push(this.createPill(workingPoints[workingPoints.length - 1], workingPoints[0], radius));
    }

    return this.reducePathItems(primitives);
  }

  private finalizeBrushPoints(releasePoint: paper.Point) {
    this.shouldCloseBrushLoop = false;

    if (this.brushPoints.length === 0) {
      this.brushPoints = [releasePoint.clone()];
      return;
    }

    const lastPoint = this.brushPoints[this.brushPoints.length - 1];
    if (lastPoint.getDistance(releasePoint) > 0.5) {
      this.brushPoints.push(releasePoint.clone());
    }

    const firstPoint = this.brushPoints[0];
    const shouldCloseLoop =
      this.brushPoints.length >= 6 &&
      releasePoint.getDistance(firstPoint) <= this.brushRadius * 1.5;

    if (shouldCloseLoop) {
      this.shouldCloseBrushLoop = true;
    }
  }

  onMouseDown(event: paper.ToolEvent) {
    if (this.isMorphing) return;
    this.isDrawing = true;
    this.lastPoint = event.point;
    this.brushPoints = [event.point.clone()];
    this.shouldCloseBrushLoop = false;
    this.dragFrameCount = 0;

    if (this.currentTool === 'brush') {
      this.clearPreview();
      this.strokeBuffer = null;
      this.brushPreviewPath = new this.scope.Path({
        segments: [event.point],
        visible: true,
      });
      this.updateBrushPreview();
    } else if (this.currentTool === 'cutter') {
      this.clearPreview();
      this.cutLine = new this.scope.Path({
        strokeColor: new this.scope.Color('#f43f5e'),
        strokeWidth: this.cutRadius * 2,
        strokeCap: 'round',
        strokeJoin: 'round',
        opacity: 0.9,
      });
      this.cutLine.add(event.point);
      this.updateCursorPreviewStyle(event.point);
    }

    this.updateGenus();
  }

  onMouseDrag(event: paper.ToolEvent) {
    if (!this.isDrawing || this.isMorphing) return;
    this.dragFrameCount++;

    if (this.currentTool === 'brush') {
      if (!this.lastPoint) return;
      const nextPoint = event.point.clone();
      this.lastPoint = event.point;
      this.brushPoints.push(nextPoint);
      if (this.brushPreviewPath) {
        this.brushPreviewPath.add(nextPoint);
      }
      this.updateBrushPreview();
      
      // Throttle genus update during drag
      if (this.dragFrameCount % 5 === 0) {
        this.updateGenus(false); // Don't reorient during drag
      }
    } else if (this.currentTool === 'cutter' && this.cutLine) {
      this.cutLine.add(event.point);
    }
  }

  onMouseUp(event: paper.ToolEvent) {
    if (!this.isDrawing || this.isMorphing) return;
    this.isDrawing = false;

    if (this.currentTool === 'brush' && this.brushPoints.length > 0) {
      this.finalizeBrushPoints(event.point);
      this.clearPreview();
      this.strokeBuffer = this.buildTubeFromPoints(this.brushPoints, this.brushRadius, this.shouldCloseBrushLoop);
      this.mergeStrokeIntoManifold(this.strokeBuffer);
      this.strokeBuffer = null;

      this.brushPoints = [];
      this.shouldCloseBrushLoop = false;
    } else if (this.currentTool === 'cutter' && this.cutLine) {
      if (this.manifold && this.cutLine.segments.length > 1) {
        const thickCut = this.buildCutTubeFromPoints(
          this.cutLine.segments.map((segment) => segment.point.clone()),
          this.cutRadius
        );

        if (thickCut) {
          const previousManifold = this.manifold;
          this.manifold = this.normalizePathItem(previousManifold.subtract(thickCut));
          previousManifold.remove();
          thickCut.remove();
        }

        this.styleManifold(this.manifold);
      }
      if (this.cutLine) {
        this.cutLine.remove();
        this.cutLine = null;
      }
    }

    this.updateGenus(true); // Reorient on mouse up
  }

  updateGenus(reorient: boolean = true) {
    const activeGeometry = this.getActiveGeometry();

    if (!activeGeometry) {
      this.genus = 0;
      this.islandCount = 0;
    } else {
      if (reorient) {
        (activeGeometry as any).reorient();
      }
      
      let islands = 0;
      let holes = 0;

      const items = (activeGeometry as any).children || [activeGeometry];
      
      if (items.length > 0) {
        items.forEach((child: any) => {
          if (child.area > 0) islands++;
          else if (child.area < 0) holes++;
        });
      }

      this.genus = holes;
      this.islandCount = islands;
    }

    if (this.onGenusChange) {
      this.onGenusChange(this.genus, this.islandCount);
    }

    // Update UI elements if they exist (backward compatibility)
    const genusSpan = document.getElementById('genus-count');
    if (genusSpan) {
      genusSpan.textContent = this.genus.toString();
    }
  }

  private resamplePath(item: paper.PathItem, pointsPerPath: number): paper.PathItem {
    const scope = this.scope;
    
    if (item instanceof scope.CompoundPath || (item as any).children) {
      const paths = (item as any).children.map((child: paper.Path) => {
        const newPath = new scope.Path();
        for (let i = 0; i < pointsPerPath; i++) {
          const offset = (i / pointsPerPath) * child.length;
          newPath.add(child.getPointAt(offset));
        }
        newPath.closed = true;
        return newPath;
      });
      return new scope.CompoundPath({ children: paths });
    } else {
      const path = item as paper.Path;
      const newPath = new scope.Path();
      for (let i = 0; i < pointsPerPath; i++) {
        const offset = (i / pointsPerPath) * path.length;
        newPath.add(path.getPointAt(offset));
      }
      newPath.closed = true;
      return newPath;
    }
  }

  private easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  private extractContours(item: paper.PathItem) {
    const scope = this.scope;
    const rawPaths = item instanceof scope.CompoundPath
      ? item.children.map((child) => child.clone({ insert: false }) as paper.Path)
      : [item.clone({ insert: false }) as paper.Path];

    const outer: paper.Path[] = [];
    const holes: paper.Path[] = [];

    rawPaths.forEach((path) => {
      path.closed = true;
      if (path.area >= 0) {
        if (!path.clockwise) path.reverse();
        outer.push(path);
      } else {
        if (path.clockwise) path.reverse();
        holes.push(path);
      }
    });

    outer.sort((a, b) => Math.abs(b.area) - Math.abs(a.area));
    holes.sort((a, b) => a.bounds.center.x - b.bounds.center.x);

    return { outer, holes };
  }

  private sampleClosedPath(path: paper.Path, count: number) {
    const points: paper.Point[] = [];
    const length = Math.max(path.length, 1);

    for (let i = 0; i < count; i++) {
      const offset = (i / count) * length;
      points.push((path.getPointAt(offset) ?? path.firstSegment.point).clone());
    }

    return points;
  }

  private buildClosedPath(points: paper.Point[], clockwise: boolean) {
    const path = new this.scope.Path({
      segments: points.map((point) => point.clone()),
      closed: true,
      insert: false,
    });

    if (path.clockwise !== clockwise) {
      path.reverse();
    }

    return path;
  }

  private rotatePoints(points: paper.Point[], startIndex: number) {
    return points.map((_, index) => points[(startIndex + index) % points.length].clone());
  }

  private getContourSeamIndex(points: paper.Point[], center: paper.Point) {
    let bestIndex = 0;
    let bestScore = Number.NEGATIVE_INFINITY;

    points.forEach((point, index) => {
      const dx = point.x - center.x;
      const dy = Math.abs(point.y - center.y);
      const score = dx * 1000 - dy;

      if (score > bestScore) {
        bestScore = score;
        bestIndex = index;
      }
    });

    return bestIndex;
  }

  private normalizeContourPoints(points: paper.Point[], center: paper.Point) {
    if (points.length === 0) {
      return points;
    }

    return this.rotatePoints(points, this.getContourSeamIndex(points, center));
  }

  private relaxContourPoints(points: paper.Point[], center: paper.Point, amount: number, radialBlend: number) {
    const count = points.length;
    if (count < 3) {
      return points.map((point) => point.clone());
    }

    return points.map((point, index) => {
      const prev = points[(index - 1 + count) % count];
      const next = points[(index + 1) % count];
      const laplace = prev.add(next).divide(2);
      const smoothed = point.multiply(1 - amount).add(laplace.multiply(amount));

      const currentRadius = point.getDistance(center);
      const neighborRadius = (prev.getDistance(center) + next.getDistance(center)) / 2;
      const targetRadius = currentRadius * (1 - radialBlend) + neighborRadius * radialBlend;

      const direction = smoothed.subtract(center);
      const length = Math.max(direction.length, 0.001);
      const normalized = direction.divide(length);

      return center.add(normalized.multiply(targetRadius));
    });
  }

  private regularizeContourAngles(points: paper.Point[], center: paper.Point, strength: number) {
    const count = points.length;
    if (count < 3) {
      return points.map((point) => point.clone());
    }

    return points.map((point, index) => {
      const prev = points[(index - 1 + count) % count];
      const next = points[(index + 1) % count];
      const incoming = point.subtract(prev);
      const outgoing = next.subtract(point);

      if (incoming.length < 0.001 || outgoing.length < 0.001) {
        return point.clone();
      }

      const inNorm = incoming.normalize();
      const outNorm = outgoing.normalize();
      const cross = inNorm.cross(outNorm);
      const isReflexLike = cross < 0;
      const localStrength = isReflexLike ? strength * 1.85 : strength * 0.7;

      const midpoint = prev.add(next).divide(2);
      const flattened = point.multiply(1 - localStrength).add(midpoint.multiply(localStrength));
      const direction = flattened.subtract(center);

      if (direction.length < 0.001) {
        return flattened;
      }

      const radius = point.getDistance(center) * (1 - localStrength * 0.25)
        + midpoint.getDistance(center) * (localStrength * 0.25);

      return center.add(direction.normalize(radius));
    });
  }

  private relaxContours(
    source: paper.PathItem,
    passes: number,
    amount: number,
    radialBlend: number,
    angleStrength: number = 0
  ) {
    const contours = this.extractContours(source);
    const relaxedOuter = contours.outer.map((path) => {
      const center = path.bounds.center;
      let points = this.normalizeContourPoints(this.sampleClosedPath(path, 96), center);

      for (let i = 0; i < passes; i++) {
        points = this.relaxContourPoints(points, center, amount, radialBlend);
        if (angleStrength > 0) {
          points = this.regularizeContourAngles(points, center, angleStrength);
        }
      }

      const relaxed = this.buildClosedPath(points, true);
      path.remove();
      return relaxed;
    });

    const relaxedHoles = contours.holes.map((path) => {
      const center = path.bounds.center;
      let points = this.normalizeContourPoints(this.sampleClosedPath(path, 96), center);

      for (let i = 0; i < passes; i++) {
        points = this.relaxContourPoints(points, center, amount, radialBlend);
        if (angleStrength > 0) {
          points = this.regularizeContourAngles(points, center, angleStrength * 1.15);
        }
      }

      const relaxed = this.buildClosedPath(points, false);
      path.remove();
      return relaxed;
    });

    const allPaths = [...relaxedOuter, ...relaxedHoles];
    if (allPaths.length === 1) {
      return allPaths[0] as paper.PathItem;
    }

    return new this.scope.CompoundPath({ children: allPaths, insert: false });
  }

  private translateContour(path: paper.Path, delta: paper.Point) {
    const translated = path.clone({ insert: false }) as paper.Path;
    translated.translate(delta);
    return translated;
  }

  private regularizeContoursTowardCanonical(source: paper.PathItem, target: paper.PathItem, strength: number) {
    const sourceContours = this.extractContours(source);
    const targetContours = this.extractContours(target);

    if (
      sourceContours.outer.length !== targetContours.outer.length ||
      sourceContours.holes.length !== targetContours.holes.length
    ) {
      sourceContours.outer.forEach((path) => path.remove());
      sourceContours.holes.forEach((path) => path.remove());
      targetContours.outer.forEach((path) => path.remove());
      targetContours.holes.forEach((path) => path.remove());
      return source.clone({ insert: false }) as paper.PathItem;
    }

    const regularizedOuter = sourceContours.outer.map((path, index) => {
      const targetCenter = targetContours.outer[index].bounds.center;
      const sourceCenter = path.bounds.center;
      const delta = targetCenter.subtract(sourceCenter).multiply(strength);
      const translated = this.translateContour(path, delta);
      path.remove();
      targetContours.outer[index].remove();
      return translated;
    });

    const regularizedHoles = sourceContours.holes.map((path, index) => {
      const targetCenter = targetContours.holes[index].bounds.center;
      const sourceCenter = path.bounds.center;
      const delta = targetCenter.subtract(sourceCenter).multiply(strength);
      const translated = this.translateContour(path, delta);
      path.remove();
      targetContours.holes[index].remove();
      return translated;
    });

    const allPaths = [...regularizedOuter, ...regularizedHoles];
    if (allPaths.length === 1) {
      return allPaths[0] as paper.PathItem;
    }

    return new this.scope.CompoundPath({ children: allPaths, insert: false });
  }

  private createStagedMorphSource(manifold: paper.PathItem, genus: number) {
    const relaxed = genus === 0
      ? this.relaxContours(manifold, 18, 0.2, 0.48, 0.12)
      : genus === 1
        ? this.relaxContours(manifold, 16, 0.18, 0.38, 0.13)
        : this.relaxContours(manifold, 10, 0.16, 0.22, 0.07);

    const canonicalTarget = this.createCanonicalTarget(genus, manifold.bounds);
    const regularized = this.regularizeContoursTowardCanonical(
      relaxed,
      canonicalTarget,
      genus >= 2 ? 0.12 : 0.18
    );

    relaxed.remove();
    canonicalTarget.remove();
    return regularized;
  }

  private alignTargetPoints(sourcePoints: paper.Point[], targetPoints: paper.Point[]) {
    if (sourcePoints.length !== targetPoints.length || targetPoints.length === 0) {
      return targetPoints;
    }

    let bestShift = 0;
    let bestScore = Number.POSITIVE_INFINITY;

    for (let shift = 0; shift < targetPoints.length; shift++) {
      let score = 0;
      for (let i = 0; i < sourcePoints.length; i++) {
        score += sourcePoints[i].getDistance(targetPoints[(i + shift) % targetPoints.length], true);
      }

      if (score < bestScore) {
        bestScore = score;
        bestShift = shift;
      }
    }

    return this.rotatePoints(targetPoints, bestShift);
  }

  private createCanonicalTarget(genus: number, bounds: paper.Rectangle) {
    const scope = this.scope;
    const center = bounds.center;
    const baseRadius = Math.max(100, Math.min(bounds.width, bounds.height) * 0.4);

    let targetPath: paper.PathItem;

    if (genus === 0) {
      targetPath = new scope.Path.Circle({
        center,
        radius: baseRadius,
        insert: false,
      });
    } else if (genus === 1) {
      const outerCircle = new scope.Path.Circle({
        center,
        radius: baseRadius,
        insert: false,
      });
      const innerCircle = new scope.Path.Circle({
        center,
        radius: baseRadius * 0.42,
        insert: false,
      });
      targetPath = outerCircle.subtract(innerCircle);
      outerCircle.remove();
      innerCircle.remove();
    } else {
      const outer = new scope.Path.Circle({
        center,
        radius: baseRadius,
        insert: false,
      });
      outer.scale(1.6, 1, center);

      const holeRadius = Math.min(baseRadius * 0.2, (baseRadius * 1.2) / Math.max(genus * 1.8, 1));
      const spacing = genus > 1 ? (baseRadius * 2.1) / (genus - 1) : 0;
      const startX = center.x - ((genus - 1) * spacing) / 2;

      let holesUnion: paper.PathItem | null = null;
      for (let i = 0; i < genus; i++) {
        const hole = new scope.Path.Circle({
          center: [startX + i * spacing, center.y],
          radius: holeRadius,
          insert: false,
        });

        if (!holesUnion) {
          holesUnion = hole;
        } else {
          const prev = holesUnion;
          holesUnion = prev.unite(hole);
          prev.remove();
          hole.remove();
        }
      }

      if (holesUnion) {
        targetPath = outer.subtract(holesUnion);
        outer.remove();
        holesUnion.remove();
      } else {
        targetPath = outer;
      }
    }

    return this.normalizePathItem(targetPath) ?? targetPath;
  }

  private buildMorphPair(source: paper.PathItem, target: paper.PathItem, pointsPerContour: number) {
    const sourceContours = this.extractContours(source);
    const targetContours = this.extractContours(target);

    if (
      sourceContours.outer.length !== targetContours.outer.length ||
      sourceContours.holes.length !== targetContours.holes.length
    ) {
      sourceContours.outer.forEach((path) => path.remove());
      sourceContours.holes.forEach((path) => path.remove());
      targetContours.outer.forEach((path) => path.remove());
      targetContours.holes.forEach((path) => path.remove());
      return null;
    }

    const sourcePaths: paper.Path[] = [];
    const targetPaths: paper.Path[] = [];
    const pairs = [
      ...sourceContours.outer.map((path, index) => ({
        source: path,
        target: targetContours.outer[index],
        clockwise: true,
      })),
      ...sourceContours.holes.map((path, index) => ({
        source: path,
        target: targetContours.holes[index],
        clockwise: false,
      })),
    ];

    pairs.forEach(({ source: sourcePath, target: targetPath, clockwise }) => {
      const sourceCenter = sourcePath.bounds.center;
      const targetCenter = targetPath.bounds.center;

      const sourcePoints = this.normalizeContourPoints(
        this.sampleClosedPath(sourcePath, pointsPerContour),
        sourceCenter
      );
      let targetPoints = this.normalizeContourPoints(
        this.sampleClosedPath(targetPath, pointsPerContour),
        targetCenter
      );
      targetPoints = this.alignTargetPoints(sourcePoints, targetPoints);

      sourcePaths.push(this.buildClosedPath(sourcePoints, clockwise));
      targetPaths.push(this.buildClosedPath(targetPoints, clockwise));

      sourcePath.remove();
      targetPath.remove();
    });

    const scope = this.scope;
    const sourceItem = sourcePaths.length === 1
      ? sourcePaths[0]
      : new scope.CompoundPath({ children: sourcePaths, insert: false });
    const targetItem = targetPaths.length === 1
      ? targetPaths[0]
      : new scope.CompoundPath({ children: targetPaths, insert: false });

    return { sourceItem, targetItem };
  }

  async simplify() {
    if (this.isMorphing || !this.manifold) return;

    this.isMorphing = true;
    const genus = this.genus;
    const manifold = this.manifold;
    const scope = this.scope;

    const sourceForMorph = this.createStagedMorphSource(manifold, genus);
    const targetPath = this.createCanonicalTarget(genus, manifold.bounds);
    const morphPair = this.buildMorphPair(sourceForMorph, targetPath, 96);
    targetPath.remove();

    if (!morphPair) {
      sourceForMorph.remove();
      const finalPath = this.createCanonicalTarget(genus, manifold.bounds);
      manifold.replaceWith(finalPath);
      this.manifold = finalPath;
      this.styleManifold(this.manifold);
      this.updateGenus(true);
      this.isMorphing = false;
      return;
    }

    const { sourceItem, targetItem } = morphPair;
    const workingItem = sourceItem.clone({ insert: false }) as paper.PathItem;
    this.styleManifold(workingItem);
    workingItem.addTo(scope.project.activeLayer);
    manifold.visible = false;

    const duration = 1200;
    const startTime = performance.now();

    const animate = (time: number) => {
      const elapsed = time - startTime;
      const t = Math.min(1, elapsed / duration);
      const ease = this.easeInOutCubic(t);
      (workingItem as any).interpolate(sourceItem, targetItem, ease);
      this.styleManifold(workingItem);

      scope.view.update();

      if (t < 1) {
        requestAnimationFrame(animate);
      } else {
        const finalPath = targetItem.clone({ insert: false }) as paper.PathItem;
        manifold.replaceWith(finalPath);
        this.manifold = finalPath;
        this.styleManifold(this.manifold);

        workingItem.remove();
        sourceItem.remove();
        targetItem.remove();
        sourceForMorph.remove();
        
        this.updateGenus(true);
        this.isMorphing = false;
      }
    };

    requestAnimationFrame(animate);
  }

  clear() {
    if (this.isMorphing) return;
    this.clearPreview();
    if (this.manifold) {
      this.manifold.remove();
      this.manifold = null;
    }
    if (this.strokeBuffer) {
      this.strokeBuffer.remove();
      this.strokeBuffer = null;
    }
    if (this.brushPreviewPath) {
      this.brushPreviewPath.remove();
      this.brushPreviewPath = null;
    }
    this.brushPoints = [];
    this.shouldCloseBrushLoop = false;
    if (this.cutCursor) {
      this.cutCursor.visible = false;
    }
    if (this.previewCircle) {
      this.previewCircle.visible = false;
    }
    this.updateGenus();
    if (this.scope && this.scope.view) this.scope.view.update();
  }

  destroy() {
    this.clearPreview();
    if (this.strokeBuffer) {
      this.strokeBuffer.remove();
      this.strokeBuffer = null;
    }
    if (this.brushPreviewPath) {
      this.brushPreviewPath.remove();
      this.brushPreviewPath = null;
    }
    this.brushPoints = [];
    this.shouldCloseBrushLoop = false;
    if (this.cutCursor) {
      this.cutCursor.remove();
      this.cutCursor = null;
    }
    if (this.scope) {
      if (this.scope.project) {
        this.scope.project.remove();
      }
    }
  }
}
