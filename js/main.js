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
    // Регистрируем плагин один раз
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
    }

    const cocktails = document.querySelectorAll('.cocktail-row');

    // Функция для настройки начальной анимации (при загрузке страницы)
    function initScrollAnimations() {
        if (typeof gsap === 'undefined') return;

        cocktails.forEach((row) => {
            const flipper = row.querySelector('.h-card-flipper');
            const glass = row.querySelector('.glass-wrapper');

            if (flipper && glass) {
                // Исходное состояние: спрятано
                gsap.set(flipper, { rotationY: 180 }); 
                gsap.set(glass, { y: 60, opacity: 0 });

                // Анимация при скролле
                // Мы сохраняем ссылку на анимацию в объект row, чтобы потом её убить при фильтре
                row.animationTl = gsap.timeline({
                    scrollTrigger: {
                        trigger: row,
                        start: "top 85%", 
                        toggleActions: "play none none reverse"
                    }
                });

                row.animationTl
                    .to(glass, { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" })
                    .to(flipper, { rotationY: 0, duration: 1.2, ease: "power2.inOut" }, "-=0.6");
            }
        });
    }

    // Запускаем анимацию при загрузке
    initScrollAnimations();


    /* -------------------------------------------
       3. ЛОГИКА ФИЛЬТРА (ПРИНУДИТЕЛЬНЫЙ ПОКАЗ)
    ------------------------------------------- */
    const filterButtons = document.querySelectorAll('.pill-btn');

    if (filterButtons.length > 0) {
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                
                // Переключаем активную кнопку
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const filterValue = btn.getAttribute('data-filter');

                cocktails.forEach(row => {
                    const flipper = row.querySelector('.h-card-flipper');
                    const glass = row.querySelector('.glass-wrapper');
                    const shouldShow = (filterValue === 'all' || row.getAttribute('data-category') === filterValue);

                    if (shouldShow) {
                        // 1. Показываем блок в верстке
                        row.style.display = 'flex';

                        // 2. ВАЖНО: Если есть GSAP, мы ПРИНУДИТЕЛЬНО анимируем в видимое состояние
                        if (typeof gsap !== 'undefined') {
                            // Если была старая скролл-анимация, убиваем её, чтобы не мешала
                            if (row.animationTl) {
                                row.animationTl.kill(); // Убиваем таймлайн
                                if (row.animationTl.scrollTrigger) row.animationTl.scrollTrigger.kill(); // Убиваем триггер
                                row.animationTl = null;
                            }

                            // Мгновенная (но плавная) анимация появления "ЗДЕСЬ И СЕЙЧАС"
                            // overwrite: true отменяет любые другие конфликтующие анимации
                            gsap.to(glass, { 
                                y: 0, 
                                opacity: 1, 
                                duration: 0.5, 
                                overwrite: true 
                            });
                            
                            gsap.to(flipper, { 
                                rotationY: 0, 
                                duration: 0.8, 
                                overwrite: true 
                            });
                        }

                    } else {
                        // Скрываем
                        if (typeof gsap !== 'undefined') {
                             // Быстро прячем перед display: none
                            gsap.to(row, { opacity: 0, duration: 0.3, onComplete: () => {
                                row.style.display = 'none';
                                row.style.opacity = '1'; // Возвращаем для будущего появления
                            }});
                        } else {
                            row.style.display = 'none';
                        }
                    }
                });

                // Обновляем глобальные триггеры (на всякий случай)
                if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
            });
        });
    }
});