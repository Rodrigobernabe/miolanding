gsap.registerPlugin(ScrollTrigger)

// --- 1. Smooth Scrolling (Lenis) ---
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
})

lenis.on('scroll', ScrollTrigger.update)

gsap.ticker.add((time) => {
    lenis.raf(time * 1000)
})

gsap.ticker.lagSmoothing(0)

// --- 2. Custom Cursor ---
// Disable custom cursor on touch devices
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

if (!isTouchDevice) {
    const cursorDot = document.getElementById('cursor-dot')
    const cursorRing = document.getElementById('cursor-ring')

    // Posiciones actuales e iterativas para el anillo (Spring physics)
    let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    let ring = { x: window.innerWidth / 2, y: window.innerHeight / 2 }

    // Utilidades de GSAP para mayor rendimiento
    const xSetDot = gsap.quickSetter(cursorDot, "x", "px")
    const ySetDot = gsap.quickSetter(cursorDot, "y", "px")
    const xSetRing = gsap.quickSetter(cursorRing, "x", "px")
    const ySetRing = gsap.quickSetter(cursorRing, "y", "px")

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX
        mouse.y = e.clientY

        // El punto interno sigue el mouse instantáneamente
        xSetDot(mouse.x)
        ySetDot(mouse.y)
    })

    // Loop para el anillo con inercia (Spring)
    gsap.ticker.add(() => {
        // Interpolación lineal
        const ease = 0.15
        ring.x += (mouse.x - ring.x) * ease
        ring.y += (mouse.y - ring.y) * ease
        xSetRing(ring.x)
        ySetRing(ring.y)
    })

    // Efectos Hover en enlaces y botones
    const hoverElements = document.querySelectorAll('a, button, .project-card, .service-card')
    hoverElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursorRing.classList.add('hovered')
            cursorDot.classList.add('hovered')
        })
        el.addEventListener('mouseleave', () => {
            cursorRing.classList.remove('hovered')
            cursorDot.classList.remove('hovered')
        })
    })
}

// --- 3. Tarjetas con Spotlight ---
const spotlightCards = document.querySelectorAll('.spotlight-card')
spotlightCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        card.style.setProperty('--mouse-x', `${x}px`)
        card.style.setProperty('--mouse-y', `${y}px`)
    })
})

// --- 4. Magnetic Buttons ---
const magneticBtns = document.querySelectorAll('.magnetic-btn, .magnetic-btn-text')

magneticBtns.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect()
        const x = e.clientX - rect.left - rect.width / 2
        const y = e.clientY - rect.top - rect.height / 2

        // Mover el botón
        gsap.to(btn, {
            x: x * 0.3,
            y: y * 0.3,
            duration: 0.6,
            ease: 'power3.out'
        })

        // Si tiene un texto interno, moverlo un poco más (Parallax interno)
        const text = btn.querySelector('.btn-text') || btn
        if (text !== btn) {
            gsap.to(text, {
                x: x * 0.2,
                y: y * 0.2,
                duration: 0.6,
                ease: 'power3.out'
            })
        }
    })

    btn.addEventListener('mouseleave', () => {
        gsap.to(btn, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.3)' })
        const text = btn.querySelector('.btn-text') || btn
        if (text !== btn) {
            gsap.to(text, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.3)' })
        }
    })
})

// --- 5. Focus Mode en Trabajo Destacado ---
const bentoCards = document.querySelectorAll('.project-card')
const body = document.body

bentoCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        body.classList.add('focus-mode')
    })
    card.addEventListener('mouseleave', () => {
        body.classList.remove('focus-mode')
    })
})

// --- 6. Animaciones GSAP / ScrollTrigger ---

// Hero Reveal: Split-Text Staggered
// Las líneas ya están envueltas en .line-inner en el HTML
document.addEventListener('DOMContentLoaded', () => {
    const heroLines = document.querySelectorAll('.hero-title .line-inner')
    const heroSubtitle = document.querySelector('.hero-subtitle')
    const heroCta = document.querySelector('.hero-cta')

    // 1. Efecto Parallax fuerte al H1 basado en posición del ratón
    window.addEventListener('mousemove', (e) => {
        const x = (window.innerWidth / 2 - e.pageX) / 40;
        const y = (window.innerHeight / 2 - e.pageY) / 40;
        gsap.to('.hero-title', {
            x: x,
            y: y,
            rotateX: y * 0.1,
            rotateY: x * 0.1,
            duration: 1,
            ease: 'power2.out'
        });
    });

    // 2. Set initial state de entrada más dramático (rotación + escalar + blur hipotético si tuvieramos soporte de filters directos)
    gsap.set(heroLines, { y: '120%', rotateX: 60, opacity: 0, scale: 0.9 })

    // Y el videofondo empieza desde un zoom sutil
    const heroVideo = document.querySelector('.hero-video')
    if (heroVideo) gsap.set(heroVideo, { scale: 1.15 })

    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } })

    // Entrada del H1
    tl.to(heroLines, {
        y: '0%',
        rotateX: 0,
        opacity: 1,
        scale: 1,
        duration: 1.5,
        stagger: 0.15,
        ease: 'expo.out'
    })
        .fromTo(heroSubtitle,
            { opacity: 0, y: 30, filter: 'blur(5px)' },
            { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.2 },
            "-=1"
        )
        .fromTo(heroCta,
            { opacity: 0, scale: 0.9, y: 20 },
            { opacity: 1, scale: 1, y: 0, duration: 1 },
            "-=0.8"
        )
        // El video hace un "zoom out" lento hacia su estado natural acompañando la entrada
        .to(heroVideo, {
            scale: 1,
            duration: 2.5,
            ease: 'power2.out'
        }, 0)
})

// Scroll-linked Scrubbing elements y Parallax vertical al scrollear
const heroContent = document.querySelector('.hero-content')
if (heroContent) {
    // Parallax del texto bajando progresivamente mientras scrolleas
    gsap.to(heroContent, {
        scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: 'bottom top',
            scrub: true,
        },
        y: 200,
        opacity: 0,
        ease: 'none'
    })
}

// Parallax de Fondo (Malla)
const bgGrid = document.querySelector('.bg-grid')
if (bgGrid) {
    gsap.to(bgGrid, {
        scrollTrigger: {
            trigger: 'body',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 2,
        },
        y: 150
    })
}

// Parallax en las imágenes de proyectos
const projectImages = document.querySelectorAll('.project-image')
projectImages.forEach(img => {
    gsap.fromTo(img,
        { backgroundPosition: '50% 0%' },
        {
            backgroundPosition: '50% 100%',
            ease: 'none',
            scrollTrigger: {
                trigger: img.parentElement,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
            }
        }
    )
})

// --- 7. Animaciones de Entrada (Responsive MatchMedia) ---
let mm = gsap.matchMedia();

// Mobile (320px - 768px): Trigger individual en la mitad exacta (top 50%)
mm.add("(max-width: 768px)", () => {
    // Seleccionamos todas las tarjetas de la página
    const cards = gsap.utils.toArray('.project-card, .service-card, .pricing-card');

    cards.forEach(card => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: 'top 50%', // Dispara justo en la mitad de la pantalla
                toggleActions: 'play none none reverse'
            },
            y: 50,
            opacity: 0,
            scale: 0.95, // Animación sutil de escala para impactar más
            duration: 0.8,
            ease: 'back.out(1.2)'
        });
    });
});

// Desktop (769px+): Animaciones Staggered originales 
mm.add("(min-width: 769px)", () => {
    // Fade-in Staggered para Servicios
    const serviceCards = document.querySelectorAll('.service-card');
    if (serviceCards.length > 0) {
        gsap.from(serviceCards, {
            scrollTrigger: {
                trigger: '.servicios',
                start: 'top 80%',
            },
            y: 50,
            opacity: 0,
            duration: 1,
            stagger: 0.2,
            ease: 'power3.out'
        });
    }
});
