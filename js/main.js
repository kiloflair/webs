document.addEventListener('DOMContentLoaded', () => {

    /* -------------------------------------------
       1. БУРГЕР МЕНЮ И ХЕДЕР
    ------------------------------------------- */
    const burger = document.querySelector('.burger');
    const navLinks = document.querySelector('.nav-links');
    const header = document.querySelector('.site-header');
    const yearSpan = document.getElementById('year');

    if (burger && navLinks) {
        burger.addEventListener('click', () => {
            burger.classList.toggle('open');
            navLinks.classList.toggle('open');
            document.body.classList.toggle('nav-open');
        });

        navLinks.addEventListener('click', (e) => {
            if (e.target.tagName === 'A') {
                burger.classList.remove('open');
                navLinks.classList.remove('open');
                document.body.classList.remove('nav-open');
            }
        });
    }

    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) header.classList.add('scrolled');
        else header.classList.remove('scrolled');
    });

    if (yearSpan) yearSpan.textContent = new Date().getFullYear();


/* -------------------------------------------
       2. ИНИЦИАЛИЗАЦИЯ GSAP (СКРОЛЛ-АНИМАЦИЯ)
    ------------------------------------------- */
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        gsap.utils.toArray('.cocktail-row').forEach((row, i) => {
            const glass = row.querySelector('.glass-wrapper');
            const flipper = row.querySelector('.h-card-flipper');
            
            // Проверка: мобильный ли это экран (меньше 1024px)
            const isMobile = window.innerWidth < 1024;

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: row,
                    start: isMobile ? "top 85%" : "top 75%", 
                    toggleActions: "play none none reverse"
                }
            });

            if (isMobile) {
                // --- АНИМАЦИЯ ДЛЯ ТЕЛЕФОНА (Вертикальная) ---
                // Стакан в рамке просто плавно проявляется и чуть приподнимается
                tl.fromTo(glass, 
                    { opacity: 0, y: 30 }, 
                    { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
                )
                // Карточка под ним выплывает следом
                .fromTo(flipper, 
                    { opacity: 0, y: 20 }, 
                    { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" },
                    "-=0.4"
                );
            } else {
                // --- АНИМАЦИЯ ДЛЯ НОУТБУКА (Горизонтальная) ---
                const isEven = i % 2 === 0;
                
                tl.fromTo(glass, 
                    { opacity: 0, x: isEven ? -100 : 100 }, 
                    { opacity: 1, x: 0, duration: 1, ease: "power2.out" }
                )
                .fromTo(flipper, 
                    { 
                        opacity: 0, 
                        rotationY: isEven ? 30 : -30, 
                        x: isEven ? 100 : -100 
                    }, 
                    { opacity: 1, rotationY: 0, x: 0, duration: 1.2, ease: "power2.out" }, 
                    "-=0.7"
                );
            }
        });
    }


/* -------------------------------------------
       3. ФИЛЬТРАЦИЯ КОКТЕЙЛЕЙ
    ------------------------------------------- */
    const filterButtons = document.querySelectorAll('.pill-btn');
    const cocktailRows = document.querySelectorAll('.cocktail-row');

    if (filterButtons.length > 0) {
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                // 1. Меняем активную кнопку
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const filter = btn.getAttribute('data-filter');

                // 2. Анимируем фильтрацию
                cocktailRows.forEach(row => {
                    const category = row.getAttribute('data-category');
                    const glass = row.querySelector('.glass-wrapper');
                    const flipper = row.querySelector('.h-card-flipper');

                    if (filter === 'all' || category === filter) {
                        // ПОКАЗЫВАЕМ
                        row.style.display = 'flex';
                        
                        // Сбрасываем старую анимацию и запускаем новую
                        gsap.fromTo(row, { opacity: 0 }, { opacity: 1, duration: 0.5 });
                        
                        // Перезапускаем анимацию стакана и карты, чтобы они выехали снова
                        gsap.fromTo(glass, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7 });
                        gsap.fromTo(flipper, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.8, delay: 0.2 });
                    } else {
                        // СКРЫВАЕМ
                        gsap.to(row, { 
                            opacity: 0, 
                            duration: 0.3, 
                            onComplete: () => { row.style.display = 'none'; } 
                        });
                    }
                });

                // 3. САМОЕ ВАЖНОЕ: Говорим GSAP пересчитать позиции скролла
                setTimeout(() => {
                    ScrollTrigger.refresh();
                }, 400);
            });
        });
    }
});