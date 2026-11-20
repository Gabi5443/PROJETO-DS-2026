class MovieBanner extends HTMLElement { //Cria um elemnto HTML no modelo Shadow Dom -> um recurso do navegador que permite que sites definam elementos HTML autocontidos no site. (autocontenção = nada que está externo a esse elemento influencia o que esta detro, tal como tudo que está dentro desse elemento não interfere o que está fora.)
  constructor() {
    super();  
    this.attachShadow({ mode: 'open' }); //cria o shadow Dom
    this.currentIndex = 1; //Define o índice que será utilizado em laçõs de repetição para que seja possivel saber a posição do laço em um array (o indice começará em 1)
    this.moviesList = []; //define uma array vazia
    this.slideTime = 6000; // define o tempo de cada slide como 6s
    this.intervalId = null; //Guarda a referencia do temporizador utilizado para contar os segundos doslie para que seja possivel zera-lo a cada slide
  }

  //Esse bloco será iniciado assim que a página carregar
  connectedCallback() {
    this.renderBase(); //Essa função (mais tarde atribuida)
    const apiUrl = this.getAttribute('api-url'); //a url de api será guardada (url essa que vem do html)
    this.fetchMovies(apiUrl); //faz a requisição para tal url para pegar (GET) os filmes da api
  }

  //esse bloco será desativado assim que  elemto sair da tela:
  disconnectedCallback() {
    if (this.intervalId) clearInterval(this.intervalId); //o temporizador para de contar (isso serve para que ele pare de comer memória)
  }


  //Define o formato da duração dos filmes
  formatDuration(minutes) {
    if (!minutes) return "";
    const h = Math.floor(minutes / 60); //converte os min em horas
    const m = minutes % 60; // pega o resto dos minuto
    return h > 0 ? `${h}h ${m}m` : `${m}m`; //retorna formatado (as horas com h no final e os min com m no final)
  }

  getAgeColor(age) { //define as cores da classificação indicativa
    if (age <= 0) return  "#00a859";   // Livre
    if (age <= 10) return "#0088cc";  // 10 anos
    if (age <= 12) return "#f5c518";  // 12 anos
    if (age <= 14) return "#f37021";  // 14 anos
    if (age <= 16) return "#cc0000";  // 16 anos
    return "#111111";                 // 18 anos
  }

  renderBase() { //função para a definição do estilo base do elemento
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          --bg-color: #090a0f;
          --accent-color: #e50914;
          --text-primary: #ffffff;
          --text-secondary: #cccccc;
          --slide-duration: ${this.slideTime}ms;
          font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .hero-banner {
          position: relative;
          width: 100%;
          height: 85vh;
          min-height: 520px;
          overflow: hidden;
          user-select: none;
          background-color: var(--bg-color);
          color: var(--text-primary);
        }

        .carousel-track {
          display: flex;
          height: 100%;
          width: 100%;
          will-change: transform;
        }

        .slide {
          min-width: 100%;
          height: 100%;
          position: relative;
          display: flex;
          align-items: center;
          padding: 0 7%;
          overflow: hidden;
        }

        .slide-bg {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
          transform: scale(1);
          transition: transform 7s ease-out;
          z-index: 0;
        }

        .slide.active .slide-bg {
          transform: scale(1.12);
        }

        .slide::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            90deg,
            rgba(9, 10, 15, 0.96) 0%,
            rgba(9, 10, 15, 0.65) 45%,
            rgba(9, 10, 15, 0.1) 100%
          ),
          linear-gradient(
            0deg,
            rgba(9, 10, 15, 1) 0%,
            rgba(9, 10, 15, 0) 30%
          );
          z-index: 1;
        }

        .slide-content {
          position: relative;
          z-index: 2;
          max-width: 650px;
        }

        .anim-item {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1),
                      transform 0.8s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .slide.active .anim-item:nth-child(1) { opacity: 1; transform: translateY(0); transition-delay: 0.2s; }
        .slide.active .anim-item:nth-child(2) { opacity: 1; transform: translateY(0); transition-delay: 0.35s; }
        .slide.active .anim-item:nth-child(3) { opacity: 1; transform: translateY(0); transition-delay: 0.5s; }
        .slide.active .anim-item:nth-child(4) { opacity: 1; transform: translateY(0); transition-delay: 0.65s; }

        .badge {
          display: inline-block;
          background: var(--accent-color);
          color: #fff;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          padding: 5px 12px;
          border-radius: 4px;
          margin-bottom: 16px;
        }

        .movie-title {
          font-size: clamp(2.5rem, 5.5vw, 4.5rem);
          font-weight: 800;
          line-height: 1.05;
          margin-bottom: 14px;
          text-shadow: 0 6px 25px rgba(0, 0, 0, 0.7);
        }

        .movie-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 0.95rem;
          color: var(--text-secondary);
          margin-bottom: 18px;
          font-weight: 500;
        }

        .age-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 28px;
          height: 26px;
          padding: 0 6px;
          border-radius: 4px;
          font-weight: 800;
          font-size: 0.85rem;
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.25);
        }

        .movie-desc {
          font-size: 1.05rem;
          line-height: 1.6;
          color: #e0e0e0;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .progress-bar {
          position: absolute;
          bottom: 0;
          left: 0;
          height: 3px;
          width: 0%;
          background: var(--accent-color);
          z-index: 5;
        }

        .progress-bar.running {
          width: 100%;
          transition: width var(--slide-duration) linear;
        }


        /* Fundo desfocado cobrindo a tela toda */
        .slide-bg-blur {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
          filter: blur(20px) brightness(0.4);
          transform: scale(1.1);
          z-index: 0;
        }

        /* Imagem principal contida, sem cortes */
        .slide-bg-contain {
          position: absolute;
          inset: 0;
          background-size: contain;
          background-repeat: no-repeat;
          background-position: center;
          z-index: 1;
        }

        /* Ajuste o z-index do gradiente escuro e do conteúdo para ficarem acima das imagens */
        .slide::after {
          z-index: 2;
        }

        .slide-content {
          position: relative;
          z-index: 3;
          max-width: 650px;
        }

      </style>

      <section class="hero-banner">
        <div class="carousel-track" id="track"></div>
        <div class="progress-bar" id="progressBar"></div>
      </section>
    `;

    this.track = this.shadowRoot.getElementById('track'); // salava a referenccia da trilha do slide (trilha = em um slide, temos uma literal trilha ou fila de fotos, o que acontece no slid é o deslocamento dessa trilha para a esquerda. Como o slide possui efeitos e é animado, da a impressão que as fotos estão mudando, mas é só a fila que esta se movendo)
    this.progressBar = this.shadowRoot.getElementById('progressBar'); //salva o progresso da barra de progreso
  }

  async fetchMovies(url) {
    if (!url) return;
    try {
      const response = await fetch(url); //faz a requeisição GET para a api
      const data = await response.json(); // converte a resposta para uma array me json

      this.moviesList = data.map(item => ({ // mapeia os dados brutos em json trazidos para a api e atribui-os a um formato padronizado. Esse mapeamento (para evita erros) tenta mapear os dados sendo eles min ou maius
        id: item.idMovie ?? item.IdMovie,
        title: item.titleMovie ?? item.TitleMovie,
        synopsis: item.synopsisMovie ?? item.SynopsisMovie,
        duration: item.durationMovie ?? item.DurationMovie,
        genre: item.genreMovie ?? item.GenreMovie,
        ageRating: item.ageRatingMovie ?? item.AgeRatingMovie ?? 0,
        photo: item.photoMovie ?? item.PhotoMovie
      }));

      if (this.moviesList.length > 0) { // se houver filmes
        this.initCarousel(); //inicia o carrossel (chama a função de iniciação)
      }
    } catch (error) { // se a api retornar um erro
      console.error("Erro ao carregar os filmes do banner:", error); // manda uma mensagem
    }
  }


  //cria o html do elemento
 createSlide(movie) {
    const slide = document.createElement('div'); //terá o formato div
    slide.classList.add('slide'); //cria-o

    const ageLabel = movie.ageRating <= 0 ? 'L' : movie.ageRating; //verifica a classificação indicativa, se for zero atribui "L" de livre para todos os públicos
    const ageColor = this.getAgeColor(movie.ageRating);//busca a cor da classificação
    const formattedDuration = this.formatDuration(movie.duration); //busca a duração do filme formatado
    const apiBaseUrl = "http://localhost:5252"; //busca o endereço da api
    const photoUrl = movie.photo.startsWith('http') ? movie.photo : `${apiBaseUrl}${movie.photo}`;//monta o endereço das fotos com base no endereço da api
 //HTML DO ELEMENTO
    slide.innerHTML = `
      <!-- Fundo desfocado para preencher o espaço -->
      <div class="slide-bg-blur" style="background-image: url('${photoUrl}')"></div>
      
      <!-- Imagem principal inteira (sem cortar) -->
      <div class="slide-bg-contain" style="background-image: url('${photoUrl}')"></div>

      <div class="slide-content">
        <span class="badge anim-item">Em Cartaz</span>
        <h1 class="movie-title anim-item">${movie.title}</h1>
        <div class="movie-meta anim-item">
          <span class="age-badge" style="background-color: ${ageColor};">${ageLabel}</span>
          <span>•</span>
          <span>${formattedDuration}</span>
          <span>•</span>
          <span>${movie.genre}</span>
        </div>
        <p class="movie-desc anim-item">${movie.synopsis}</p>
      </div>
    `;
    return slide; //retorna o carrossel
  }



  initCarousel() { //iniciador do carrossel
    if (this.moviesList.length === 1) { // se o tamanho da lista de filmes for igual a 1  
      const singleSlide = this.createSlide(this.moviesList[0]); //exibe a foto sem passar pela lógica do banner infinito montado pela função a seguir
      this.track.appendChild(singleSlide);
      this.activateSlide(0);
      return;
    }
// Lógica do slide infinito
    // Clona o último filme e coloca no começo
    const lastClone = this.createSlide(this.moviesList[this.moviesList.length - 1]); //clona o ultimo filme
    lastClone.id = 'last-clone'; // atribui a ele um id
    this.track.appendChild(lastClone); // cola ele no começo

    // Adiciona todos os filmes à trilha (à fila) de filmes que compõe o slide
    this.moviesList.forEach(movie => { //
      this.track.appendChild(this.createSlide(movie));
    });

    // Clona o primeiro filme e coloca no final
    const firstClone = this.createSlide(this.moviesList[0]);
    firstClone.id = 'first-clone';
    this.track.appendChild(firstClone);

    this.moveTrack(false); //atribui o começo da trilha no primeiro filme e desativa a animação (o movimento deve ocorrer apenas a partir do segundo filme)
    this.activateSlide(this.currentIndex); //ativa o slide quando o índice se mover


    //animação
    this.track.addEventListener('transitionend', () => {
      const slides = this.shadowRoot.querySelectorAll('.slide');
      if (slides[this.currentIndex]?.id === 'first-clone') { // se o banner chegou no clone do primeiro filme localizado o final da fila:
        this.currentIndex = 1; // o indice se torna 1 denovo
        this.moveTrack(false); // a trilha para de se mover
        slides.forEach(s => s.classList.remove('active'));
        slides[this.currentIndex].classList.add('active');
      }
    });

    //seta o tempo de cada filme no banner a
    this.intervalId = setInterval(() => {
      this.currentIndex++;
      this.moveTrack(true);
      this.activateSlide(this.currentIndex);
    }, this.slideTime);
  }

//   função para animar a transição

  moveTrack(animate = true) {
    this.track.style.transition = animate
      ? 'transform 1.1s cubic-bezier(0.77, 0, 0.175, 1)'
      : 'none';
    this.track.style.transform = `translateX(-${this.currentIndex * 100}%)`;
  }


  //tira o status de ativo ou running das coisas para o navegador entender que tem que repetir as animações a cada troca de ídice

  activateSlide(index) {
    const slides = this.shadowRoot.querySelectorAll('.slide');
    slides.forEach(s => s.classList.remove('active'));
    if (slides[index]) slides[index].classList.add('active');
    this.progressBar.classList.remove('running');
    void this.progressBar.offsetWidth; 
    this.progressBar.classList.add('running');
  }
}
// define movie-banner o nome da tag do elemento
customElements.define('movie-banner', MovieBanner);