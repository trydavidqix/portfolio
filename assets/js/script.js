// Configurações e Constantes
const CONFIG = {
  SCROLL_THRESHOLD: 100,
  ANIMATION_DELAY: 16,
  NOISE_OPACITY: 15,
  CURSOR_SIZES: {
    default: { cursor: 8, follower: 40 },
    hover: { cursor: 16, follower: 60 },
  },
  CAROUSEL_INTERVAL: 1500, // Intervalo de 1,5 segundo para troca de imagens
};

// Utilitários
const utils = {
  debounce(func, wait) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  },

  lerp(start, end, factor) {
    return start + (end - start) * factor;
  },
};

// Gerenciador de Tema
class ThemeManager {
  constructor() {
    this.themeToggle = document.querySelector(".switch input");
    this.init();
  }

  init() {
    // Verificar tema salvo
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      this.setTheme(savedTheme);
      // Atualizar o estado do toggle baseado no tema salvo
      if (this.themeToggle) {
        this.themeToggle.checked = savedTheme === "dark";
      }
    }

    // Configurar event listener
    if (this.themeToggle) {
      this.themeToggle.addEventListener("click", () => {
        const newTheme = this.themeToggle.checked ? "dark" : "light";
        this.setTheme(newTheme);
      });
    }
  }

  setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }

  // Adicionar o método toggle que estava faltando
  toggle() {
    const currentTheme =
      document.documentElement.getAttribute("data-theme") || "light";
    const newTheme = currentTheme === "light" ? "dark" : "light";

    // Atualizar o toggle switch também
    if (this.themeToggle) {
      this.themeToggle.checked = newTheme === "dark";
    }

    this.setTheme(newTheme);
  }
}

// Simplificação do gerenciador de menu para garantir funcionamento correto
class MenuManager {
  constructor() {
    this.menuButton = document.querySelector(".menu-button");
    this.menu = document.querySelector(".menu");
    this.menuItems = document.querySelectorAll(".menu-item");
    this.init();
  }

  init() {
    // Verificar e corrigir elementos do DOM
    if (!this.menuButton || !this.menu) {
      console.error("Elementos de menu não encontrados");
      return;
    }

    // Toggle do menu ao clicar no botão
    this.menuButton.addEventListener("click", (e) => {
      e.stopPropagation();
      this.toggleMenu();
    });

    // Fechar menu ao clicar em links
    this.menuItems.forEach((item) => {
      item.addEventListener("click", () => {
        if (window.innerWidth <= 1024) {
          this.closeMenu();
        }
        });
    });

    // Fechar ao clicar fora do menu
    document.addEventListener("click", (e) => {
      if (
        window.innerWidth <= 1024 &&
        !this.menu.contains(e.target) &&
        !this.menuButton.contains(e.target) &&
        this.menu.classList.contains("active")
      ) {
        this.closeMenu();
      }
    });

    // Verificação inicial
    this.checkScreenSize();

    // Reajustar ao redimensionar
    window.addEventListener("resize", () => {
      this.checkScreenSize();
    });
  }

  checkScreenSize() {
    if (window.innerWidth > 1024) {
      this.menu.style.display = "flex";
    } else if (!this.menu.classList.contains("active")) {
      this.menu.style.display = "none";
    }
  }

  toggleMenu() {
    const isActive = this.menu.classList.toggle("active");
    this.menuButton.classList.toggle("active", isActive);
    this.menu.style.display = isActive ? "flex" : "none";

    // Log para debugging
    console.log("Menu toggled:", isActive ? "active" : "inactive");
  }

  closeMenu() {
    this.menu.classList.remove("active");
    this.menuButton.classList.remove("active");

    if (window.innerWidth <= 1024) {
      this.menu.style.display = "none";
    }
  }
}

// Gerenciador de Scroll
class ScrollManager {
  constructor() {
    this.header = document.querySelector(".header");
    this.sections = document.querySelectorAll("section");
    this.menuLinks = document.querySelectorAll(".menu a");
    this.init();
  }

  init() {
    this.handleScroll = utils.debounce(
      this.handleScroll.bind(this),
      CONFIG.ANIMATION_DELAY
    );
    window.addEventListener("scroll", this.handleScroll);
    this.initSmoothScroll();

    // Forçar a verificação inicial para destacar a seção "sobre"
    setTimeout(() => {
      this.handleScroll();

      // Se estiver no topo da página, destacar o link "sobre"
      if (window.pageYOffset < 50) {
        this.menuLinks.forEach((link) => {
          link.classList.toggle(
            "active",
            link.getAttribute("href") === "#sobre"
          );
        });
      }
    }, 100);
  }

  handleScroll() {
    // Header
    this.header.classList.toggle(
      "scrolled",
      window.pageYOffset > CONFIG.SCROLL_THRESHOLD
    );

    // Menu ativo
    let current = "";
    this.sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      if (window.pageYOffset >= sectionTop - 150) {
        current = section.getAttribute("id");
      }
    });

    this.menuLinks.forEach((link) => {
      link.classList.toggle(
        "active",
        link.getAttribute("href").slice(1) === current
      );
    });
  }

  initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", (e) => {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute("href"));
        target?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }
}

// Gerenciador de Animações
class AnimationManager {
  constructor() {
    this.observer = new IntersectionObserver(
      this.handleIntersection.bind(this),
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
      }
    );
    this.init();
  }

  init() {
    document
      .querySelectorAll(
        ".projeto-card, .section-header, .sobre-content, .contato-content"
      )
      .forEach((el) => {
        el.classList.add("fade-up");
        this.observer.observe(el);
      });

    // Adiciona a função de forçar animações do animation-fix.js
    this.forceAnimations();
    
    // Eventos para forçar animações
    window.addEventListener("resize", () => this.forceAnimations());
    window.addEventListener("orientationchange", () => this.forceAnimations());
    window.addEventListener("load", () => this.forceAnimations());

    // Verificações periódicas
    setTimeout(() => this.forceAnimations(), 500);
    setTimeout(() => this.forceAnimations(), 1000);
    setTimeout(() => this.forceAnimations(), 3000);
  }

  handleIntersection(entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        this.observer.unobserve(entry.target);
      }
    });
  }

  // Função do animation-fix.js incorporada
  forceAnimations() {
    console.log("Forçando animações...");

    // Animar linhas do mega-título
    document.querySelectorAll(".mega-title .line").forEach((line, index) => {
      line.style.animation = "none";
      line.style.opacity = "0";
      line.style.transform = "translateY(100%)";
      void line.offsetWidth;
      
      setTimeout(() => {
        line.style.animation = "";
        line.style.animationName = "reveal";
        line.style.animationDuration = "0.8s";
        line.style.animationTimingFunction = "cubic-bezier(0.65, 0, 0.35, 1)";
        line.style.animationFillMode = "forwards";
        line.style.animationDelay = index * 0.2 + "s";
      }, 50);
    });

    // Animar descrição do hero
    const heroDesc = document.querySelector(".hero-description");
    if (heroDesc) {
      heroDesc.style.animation = "none";
      heroDesc.style.opacity = "0";
      heroDesc.style.transform = "translateY(20px)";
      void heroDesc.offsetWidth;

      setTimeout(() => {
        heroDesc.style.animation = "";
        heroDesc.style.animationName = "fadeUp";
        heroDesc.style.animationDuration = "0.8s";
        heroDesc.style.animationTimingFunction = "cubic-bezier(0.65, 0, 0.35, 1)";
        heroDesc.style.animationFillMode = "forwards";
        heroDesc.style.animationDelay = "0.8s";
      }, 50);
    }

    // Animar elementos fade-up
    document.querySelectorAll(".fade-up").forEach((el) => {
      const rect = el.getBoundingClientRect();
      const isVisible =
        rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.bottom >= 0;

      if (isVisible) {
        el.classList.add("visible");
      }
    });
  }
}

// Gerenciador de Efeitos Visuais
class VisualEffectsManager {
  constructor() {
    this.setupNoise();
    this.setupCursor();
    this.lastFrameTime = 0;
    this.frameInterval = 1000 / 15;
    this.isAnimating = false;
    this.noiseBuffer = null;
    this.noiseContext = null;
    this.noiseData = null;
    this.noiseSize = 64;
    this.focusTimeout = null;
  }

  setupNoise() {
    const canvas = document.getElementById("noise-canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    this.noiseContext = ctx;

    // Criar buffer menor para otimizar a renderização
    const buffer = document.createElement("canvas");
    buffer.width = this.noiseSize;
    buffer.height = this.noiseSize;
    const bufferCtx = buffer.getContext("2d");
    if (!bufferCtx) return;

    this.noiseBuffer = buffer;

    // Pré-computar dados de ruído
    const dataSize = this.noiseSize * this.noiseSize * 4;
    this.noiseData = new Uint8ClampedArray(dataSize);

    // Inicializar dados de ruído
    for (let i = 0; i < dataSize; i += 4) {
      const value = Math.random() * 255;
      this.noiseData[i] = this.noiseData[i + 1] = this.noiseData[i + 2] = value;
      this.noiseData[i + 3] = CONFIG.NOISE_OPACITY;
    }

    const resize = () => {
      if (!canvas || !buffer) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener("resize", resize);

    const renderNoise = (timestamp) => {
      if (
        !this.isAnimating ||
        !this.noiseData ||
        !this.noiseBuffer ||
        !this.noiseContext
      )
        return;

      if (timestamp - this.lastFrameTime >= this.frameInterval) {
        try {
          // Atualizar apenas alguns pixels aleatórios
          const numUpdates = 100; // Número de pixels para atualizar por frame
          const dataLength = this.noiseData.length;

          for (let i = 0; i < numUpdates; i++) {
            const index = Math.floor(Math.random() * (dataLength / 4)) * 4;
            if (index >= 0 && index < dataLength) {
              const value = Math.random() * 255;
              this.noiseData[index] =
                this.noiseData[index + 1] =
                this.noiseData[index + 2] =
                  value;
            }
          }

          // Renderizar o ruído no buffer
          const imageData = new ImageData(
            new Uint8ClampedArray(this.noiseData),
            this.noiseSize,
            this.noiseSize
          );
          bufferCtx.putImageData(imageData, 0, 0);

          // Desenhar o buffer no canvas principal
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(buffer, 0, 0, canvas.width, canvas.height);

          this.lastFrameTime = timestamp;
        } catch (error) {
          console.error("Erro na renderização do ruído:", error);
          this.isAnimating = false;
        }
      }
      requestAnimationFrame(renderNoise);
    };

    // Iniciar animação apenas quando a página estiver visível
    document.addEventListener("visibilitychange", () => {
      this.isAnimating = !document.hidden;
      if (this.isAnimating) {
        renderNoise(0);
      }
    });

    // Iniciar animação
    this.isAnimating = true;
    renderNoise(0);
  }

  setupCursor() {
    const cursor = document.querySelector(".cursor");
    const follower = document.querySelector(".cursor-follower");
    if (!cursor || !follower) return;

    // Otimizar o evento de movimento do mouse
    const handleMouseMove = (e) => {
      if (this.focusTimeout) {
        cancelAnimationFrame(this.focusTimeout);
      }

      this.focusTimeout = requestAnimationFrame(() => {
        cursor.style.left = `${e.clientX}px`;
        cursor.style.top = `${e.clientY}px`;
    
    setTimeout(() => {
          follower.style.left = `${e.clientX}px`;
          follower.style.top = `${e.clientY}px`;
    }, 100);
});
    };

    // Usar passive event listener para melhor performance
    document.addEventListener("mousemove", handleMouseMove, { passive: true });

    // Otimizar eventos de hover
    const handleHover = (state) => {
      if (this.focusTimeout) {
        cancelAnimationFrame(this.focusTimeout);
      }

      this.focusTimeout = requestAnimationFrame(() => {
        this.setCursorSize(state);
      });
    };

    // Adicionar eventos de hover otimizados
    document
      .querySelectorAll("a, button, input, textarea")
      .forEach((element) => {
        element.addEventListener("mouseenter", () => handleHover("hover"), {
          passive: true,
        });
        element.addEventListener("mouseleave", () => handleHover("default"), {
          passive: true,
    });
});
  }

  setCursorSize(state) {
    const cursor = document.querySelector(".cursor");
    const follower = document.querySelector(".cursor-follower");
    if (!cursor || !follower) return;

    const sizes = CONFIG.CURSOR_SIZES[state];
    if (!sizes) return;

    if (this.focusTimeout) {
      cancelAnimationFrame(this.focusTimeout);
    }

    this.focusTimeout = requestAnimationFrame(() => {
      cursor.style.width = `${sizes.cursor}px`;
      cursor.style.height = `${sizes.cursor}px`;
      follower.style.width = `${sizes.follower}px`;
      follower.style.height = `${sizes.follower}px`;
    });
  }
}

// Gerenciador de Projetos
class ProjectManager {
  constructor() {
    this.projects = document.querySelectorAll(".projeto-card");
    this.carouselIntervals = []; // Armazenar referências aos intervalos
    this.init();
  }

  init() {
    // Inicializar todos os carrosséis
    const carousels = document.querySelectorAll(".carousel");
    carousels.forEach((carousel) => {
      this.setupAutoCarousel(carousel);
    });

    // Adicionar logs para depuração
    console.log(`Inicializados ${carousels.length} carrosséis`);
  }

  setupAutoCarousel(carousel) {
    const images = Array.from(carousel.querySelectorAll(".carousel-img"));
    console.log(`Encontradas ${images.length} imagens no carrossel`, carousel);

    if (images.length <= 1) return; // Não é necessário para uma única imagem

    // Certificar-se de que apenas uma imagem tenha a classe 'active' inicialmente
    images.forEach((img, i) => {
      if (i === 0) {
        img.classList.add("active");
      } else {
        img.classList.remove("active");
      }
    });

    let currentIndex = 0;

    // Função para avançar para a próxima imagem
    const nextImage = () => {
      // Remover classe 'active' de todas as imagens
      images.forEach((img) => img.classList.remove("active"));

      // Avançar para a próxima imagem
      currentIndex = (currentIndex + 1) % images.length;

      // Adicionar classe 'active' apenas à próxima imagem
      images[currentIndex].classList.add("active");

      console.log(`Carrossel: alterada imagem para índice ${currentIndex}`);
    };

    // Limpar qualquer intervalo existente para evitar múltiplas instâncias
    if (carousel._carouselInterval) {
      clearInterval(carousel._carouselInterval);
    }

    // Iniciar o intervalo para troca automática e armazenar a referência
    const intervalId = setInterval(nextImage, CONFIG.CAROUSEL_INTERVAL);
    carousel._carouselInterval = intervalId;
    this.carouselIntervals.push(intervalId);

    // Eventos de pausa e retomada (opcional)
    carousel.addEventListener("mouseenter", () => {
      if (carousel._carouselInterval) {
        clearInterval(carousel._carouselInterval);
        carousel._carouselInterval = null;
      }
    });

    carousel.addEventListener("mouseleave", () => {
      if (!carousel._carouselInterval) {
        const newIntervalId = setInterval(nextImage, CONFIG.CAROUSEL_INTERVAL);
        carousel._carouselInterval = newIntervalId;
        this.carouselIntervals.push(newIntervalId);
      }
    });
  }
}

// Função para alternar o tema - simplificada
function toggleMode() {
  const currentTheme =
    document.documentElement.getAttribute("data-theme") || "light";
  const newTheme = currentTheme === "light" ? "dark" : "light";

  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);

  // Atualizar o botão
  const themeToggle = document.querySelector(".switch input");
  if (themeToggle) {
    themeToggle.checked = newTheme === "dark";
  }
}

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
  const themeManager = new ThemeManager();
  const scrollManager = new ScrollManager();
  const animationManager = new AnimationManager();
  const visualEffects = new VisualEffectsManager();

  // Inicializando o gerenciador de projetos com um pequeno atraso para garantir
  // que todos os elementos estejam carregados corretamente
  setTimeout(() => {
    const projectManager = new ProjectManager();
    console.log("Carrossel inicializado com atraso para garantir carregamento");
  }, 500);

  // Inicializar MenuManager com alta prioridade
  setTimeout(() => {
    const menuManager = new MenuManager();
    console.log("Menu inicializado");
  }, 100);

  // Scroll para a seção "sobre" ao carregar a página, se estiver no topo
  if (window.location.hash === "" && window.pageYOffset < 50) {
    const sobreSection = document.getElementById("sobre");
    if (sobreSection) {
      sobreSection.scrollIntoView({ behavior: "auto" });
    }
  }
});

// Função adicional para reiniciar os carrosséis caso necessário
window.reiniciarCarrosséis = function () {
  console.log("Reiniciando carrosséis...");
  const projectManager = new ProjectManager();
};
