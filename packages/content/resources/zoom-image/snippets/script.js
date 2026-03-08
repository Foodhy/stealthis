class ImageMagnifier {
  constructor(targetElement) {
    this.target = targetElement;
    this.img = targetElement.querySelector('img');
    this.lens = targetElement.querySelector('.js-zoom-lens');
    this.result = document.querySelector(targetElement.dataset.result);
    this.zoomImage = this.img.dataset.zoom || this.img.src;
    
    if (!this.img || !this.lens || !this.result) return;

    this.isActive = false;
    this.cx = 0;
    this.cy = 0;

    this.init();
  }

  init() {
    // We must wait for image to load to get dimensions
    if (this.img.complete) {
      this.setup();
    } else {
      this.img.addEventListener('load', () => this.setup());
    }

    // Set high-res background
    this.result.style.backgroundImage = `url('${this.zoomImage}')`;

    // Event Bindings
    this.target.addEventListener('mousemove', (e) => this.move(e));
    this.target.addEventListener('mouseenter', () => this.enable());
    this.target.addEventListener('mouseleave', () => this.disable());
    
    // Support touch
    this.target.addEventListener('touchmove', (e) => this.move(e), { passive: false });
    this.target.addEventListener('touchstart', () => this.enable());
    this.target.addEventListener('touchend', () => this.disable());

    // Window resize handling
    window.addEventListener('resize', () => this.setup());
  }

  setup() {
    /* Calculate the ratio between result DIV and lens: */
    this.cx = this.result.offsetWidth / this.lens.offsetWidth;
    this.cy = this.result.offsetHeight / this.lens.offsetHeight;

    /* Set background size for the result DIV: */
    const width = this.img.offsetWidth;
    const height = this.img.offsetHeight;
    
    this.result.style.backgroundSize = `${width * this.cx}px ${height * this.cy}px`;
  }

  enable() {
    this.isActive = true;
    this.result.classList.add('active');
  }

  disable() {
    this.isActive = false;
    this.result.classList.remove('active');
  }

  move(e) {
    if (!this.isActive) return;

    // Prevent scrolling on touch
    if (e.type === 'touchmove') e.preventDefault();

    const rect = this.img.getBoundingClientRect();
    
    // Get cursor position relative to image
    let x = (e.pageX || e.touches[0].pageX) - rect.left - window.scrollX;
    let y = (e.pageY || e.touches[0].pageY) - rect.top - window.scrollY;

    // Constrain lens within image boundaries
    const halfWidth = this.lens.offsetWidth / 2;
    const halfHeight = this.lens.offsetHeight / 2;

    if (x > this.img.offsetWidth) x = this.img.offsetWidth;
    if (x < 0) x = 0;
    if (y > this.img.offsetHeight) y = this.img.offsetHeight;
    if (y < 0) y = 0;

    // Update Lens Position (centered on cursor)
    this.lens.style.left = `${x}px`;
    this.lens.style.top = `${y}px`;

    // Update Result Background Position
    // The calculation needs to offset by half the lens to center the view
    const bgX = (x * this.cx) - (this.result.offsetWidth / 2);
    const bgY = (y * this.cy) - (this.result.offsetHeight / 2);

    this.result.style.backgroundPosition = `-${bgX}px -${bgY}px`;
  }
}

// Instantiate all magnifiers on the page
function initMagnifiers() {
  const targets = document.querySelectorAll('.js-zoom-target');
  targets.forEach(target => new ImageMagnifier(target));
}

// Startup
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMagnifiers);
} else {
    initMagnifiers();
}
