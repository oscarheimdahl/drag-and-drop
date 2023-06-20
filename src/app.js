import konva from 'konva';

const stage = new konva.Stage({
  container: 'container',
  width: window.innerWidth,
  height: window.innerHeight,
  draggable: true,
});

const layer = new konva.Layer({});

for (let i = 0; i < 100; i++) {
  const dim = 50;
  const rect = new konva.Rect({
    width: dim,
    height: dim,
    x: Math.random() * (window.innerWidth - dim),
    y: Math.random() * (window.innerHeight - dim),
    fill: `hsl(${Math.floor(Math.random() * 255)} 90% 70%)`,
    draggable: true,
    id: i + '',
    stroke: '#333',
    strokeWidth: 1,
  });

  layer.add(rect);
}

document.addEventListener('keydown', (e) => {
  stage.draggable(!stage.draggable());
  if (stage.draggable()) document.body.classList.add('draggable');
  else document.body.classList.remove('draggable');
});

stage.addEventListener('dragmove', (e) => {});

stage.addEventListener('wheel', (e) => {
  const zoomIn = e.wheelDeltaY > 0;
  if (stage.scaleX() > 4 && zoomIn) return;
  if (stage.scaleX() < 0.1 && !zoomIn) return;
  let factor = 0.8;
  if (zoomIn) factor = 1 / factor;

  stage.scaleX(stage.scaleX() * factor);
  stage.scaleY(stage.scaleY() * factor);

  const dx = (e.x - stage.x()) * (factor - 1);
  const dy = (e.y - stage.y()) * (factor - 1);
  stage.x(stage.x() - dx);
  stage.y(stage.y() - dy);
});

layer.children.forEach((thisRect) => {
  thisRect.addEventListener('mouseup', () => {
    snap(thisRect);
  });
  thisRect.addEventListener('dragmove', () => {
    highlightSnap(thisRect);
  });
  thisRect.addEventListener('dragend', () => {
    thisRect.opacity(1);
  });
});

function highlightSnap(thisRect) {
  thisRect.moveToTop();
  let snapFound = false;
  layer.children.forEach((otherRect) => {
    const sameRect = otherRect.id() === thisRect.id();
    if (sameRect) return;
    const canSnap = canSnapTo(thisRect, otherRect);
    if (canSnap) {
      thisRect.opacity(0.5);
      snapFound = true;
    } else if (!snapFound) thisRect.opacity(1);
  });
  snapFound = false;
}

function snap(thisRect) {
  layer.children.forEach((otherRect) => {
    const sameRect = otherRect.id() === thisRect.id();
    if (sameRect) return;

    const direction = canSnapTo(thisRect, otherRect);
    if (!direction) return;
    switch (direction) {
      case 'top': {
        const otherYTop = otherRect.y() - otherRect.height();
        thisRect.y(otherYTop);
        thisRect.x(otherRect.x());
        break;
      }
      case 'left': {
        const otherXLeft = otherRect.x() - otherRect.width();
        thisRect.x(otherXLeft);
        thisRect.y(otherRect.y());
        break;
      }
      case 'right': {
        const otherXRight = otherRect.x() + otherRect.width();
        thisRect.x(otherXRight);
        thisRect.y(otherRect.y());
        break;
      }
      case 'bottom': {
        const otherYBottom = otherRect.y() + otherRect.height();
        thisRect.y(otherYBottom);
        thisRect.x(otherRect.x());
        break;
      }
    }
  });
}

//doesnt work well with none square rects
function canSnapTo(thisRect, otherRect) {
  const snapDistance = thisRect.width() / 4;
  const otherXRight = otherRect.x() + otherRect.width();
  const otherXLeft = otherRect.x() - otherRect.width();
  const otherYBottom = otherRect.y() + otherRect.height();
  const otherYTop = otherRect.y() - otherRect.height();
  const distanceToRedRight = Math.abs(thisRect.x() - otherXRight);
  const distanceToRedLeft = Math.abs(thisRect.x() - otherXLeft);
  const distanceToRedBottom = Math.abs(thisRect.y() - otherYBottom);
  const distanceToRedTop = Math.abs(thisRect.y() - otherYTop);
  const xWithinSnap = Math.abs(otherRect.x() - thisRect.x()) < snapDistance;
  const yWithinSnap = Math.abs(otherRect.y() - thisRect.y()) < snapDistance;

  if (yWithinSnap) {
    if (distanceToRedLeft < snapDistance) {
      return 'left';
    }
    if (distanceToRedRight < snapDistance) {
      return 'right';
    }
  }
  if (xWithinSnap) {
    if (distanceToRedTop < snapDistance) {
      return 'top';
    }
    if (distanceToRedBottom < snapDistance) {
      return 'bottom';
    }
  }
}
stage.add(layer);
