
CREATE DATABASE IF NOT EXISTS CINEMA;

USE CINEMA;

CREATE TABLE USERS (
    ID_USERS INT AUTO_INCREMENT PRIMARY KEY,
    NAME_USERS VARCHAR(100) NOT NULL,
    EMAIL_USERS VARCHAR(200) NOT NULL UNIQUE,
    PASSWORD_USERS VARCHAR(255) NOT NULL,
    PHOTO_USERS VARCHAR(255) NULL, 
    ROLE_USERS ENUM ('WORKER', 'CLIENT') NOT NULL DEFAULT 'CLIENT'
);

CREATE TABLE MOVIE (
    ID_MOVIE INT AUTO_INCREMENT PRIMARY KEY, 
    TITLE_MOVIE VARCHAR(255) NOT NULL,
    SYNOPSIS_MOVIE TEXT NOT NULL,
    DURATION_MOVIE INT NOT NULL, 
    GENRE_MOVIE VARCHAR(255) NOT NULL, 
    AGE_RATING_MOVIE INT NOT NULL,
    PHOTO_MOVIE VARCHAR(255) NOT NULL
);

CREATE TABLE ROOM (
    ID_ROOM INT AUTO_INCREMENT PRIMARY KEY, 
    NAME_ROOM VARCHAR(100) NOT NULL,
    TOTAL_ROWS_ROOM INT NOT NULL,
    SEATS_PER_ROW_ROOM INT NOT NULL
);

CREATE TABLE SESSION (
    ID_SESSION INT AUTO_INCREMENT PRIMARY KEY, 
    SHOW_TIME_SESSION DATETIME NOT NULL, 
    PRICE_SESSION DECIMAL(10,2) NOT NULL,
    ID_MOVIE_FK INT,
    ID_ROOM_FK INT, 
    FOREIGN KEY (ID_MOVIE_FK) REFERENCES MOVIE (ID_MOVIE), 
    FOREIGN KEY (ID_ROOM_FK) REFERENCES ROOM (ID_ROOM) 
);

CREATE TABLE ORDERS (
    ID_ORDER INT AUTO_INCREMENT PRIMARY KEY,
    TOTAL_PRICE_ORDER DECIMAL(10, 2) NOT NULL,
    PAYMENT_METHOD_ORDER VARCHAR(50) NOT NULL,
    ORDER_DATE_ORDER DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ID_USERS_FK INT NOT NULL,
    FOREIGN KEY (ID_USERS_FK) REFERENCES USERS(ID_USERS)
);

CREATE TABLE TICKET (
    ID_TICKET INT AUTO_INCREMENT PRIMARY KEY, 
    SEAT_NUMBER_TICKET VARCHAR(5) NOT NULL,
    TYPE_TICKET ENUM ('INTEIRA', 'MEIA') NOT NULL DEFAULT 'INTEIRA',
    FINAL_PRICE_TICKET DECIMAL (10,2) NOT NULL,
    ID_ORDER_FK INT NOT NULL,
    ID_SESSION_FK INT NOT NULL, 
    FOREIGN KEY (ID_ORDER_FK) REFERENCES ORDERS(ID_ORDER) ON DELETE CASCADE,
    FOREIGN KEY (ID_SESSION_FK) REFERENCES SESSION(ID_SESSION),
    UNIQUE KEY UQ_SESSION_SEAT (ID_SESSION_FK, SEAT_NUMBER_TICKET) 
);



INSERT INTO ROOM (NAME_ROOM, TOTAL_ROWS_ROOM, SEATS_PER_ROW_ROOM) VALUES
('Sala 01 - IMAX', 15, 20),
('Sala 02 - 3D', 12, 16),
('Sala 03 - VIP', 6, 8),
('Sala 04 - Convencional', 10, 14),
('Sala 05 - Convencional', 10, 14),
('Sala 06 - Macro XE', 14, 18),
('Sala 07 - D-BOX', 8, 12),
('Sala 08 - Lounge', 5, 10),
('Sala 09 - 4DX', 9, 12),
('Sala 10 - Premier', 7, 10);



INSERT INTO MOVIE (TITLE_MOVIE, SYNOPSIS_MOVIE, DURATION_MOVIE, GENRE_MOVIE, AGE_RATING_MOVIE, PHOTO_MOVIE)
VALUES
('Duna: Parte Dois', 'Paul Atreides une forças com Chani e os Fremen para buscar vingança contra os conspiradores que destruíram sua família.', 166, 'Ficção Científica', 14, '/uploads/movies/duna2.jpeg'),

('Oppenheimer', 'A história do físico J. Robert Oppenheimer e seu papel no desenvolvimento da primeira bomba atômica durante a Segunda Guerra Mundial.', 180, 'Drama', 16, '/uploads/movies/oppenheimer.jpg'),

('Divertida Mente 2', 'Riley está entrando na adolescência e precisa lidar com novas emoções que chegam para transformar sua mente.', 96, 'Animação', 0, '/uploads/movies/divertida_mente_2.jpg'),

('Guerra Civil', 'Em um futuro próximo, jornalistas atravessam os Estados Unidos durante uma violenta guerra civil para registrar os acontecimentos.', 109, 'Ação', 18, '/uploads/movies/guerra_civil.jpg'),


('Ainda Estou Aqui', 'Durante a ditadura militar brasileira, uma mulher luta para descobrir o destino de seu marido desaparecido e proteger sua família.', 136, 'Drama', 14, '/uploads/movies/ainda_estou_aqui.jpg'),


('Robô Selvagem', 'Após um naufrágio, um robô inteligente fica preso em uma ilha desabitada e precisa aprender a conviver com os animais.', 102, 'Animação', 0, '/uploads/movies/robo_selvagem.jpg'),


('Batman', 'Após dois anos combatendo o crime em Gotham, Batman investiga uma série de assassinatos que revela uma rede de corrupção na cidade.', 176, 'Ação', 14, '/uploads/movies/batman.jpg'),



('Pobres Criaturas', 'Uma jovem é trazida de volta à vida por um cientista e embarca em uma jornada de descobertas pelo mundo.', 141, 'Ficção Científica', 18, '/uploads/movies/pobres_criaturas.jpg'),


('A Substância', 'Uma celebridade insatisfeita com o envelhecimento experimenta um tratamento misterioso que promete criar uma versão mais jovem de si mesma.', 140, 'Terror', 18, '/uploads/movies/a_substancia.jpg'),

('Missão: Impossível - O Acerto Final', 'Ethan Hunt enfrenta uma nova ameaça tecnológica que pode colocar o futuro da humanidade em risco.', 169, 'Ação', 14, '/uploads/movies/missao_impossivel.jpg'),

('Flow', 'Um gato solitário tem seu lar destruído por uma grande enchente e precisa se unir a outras espécies em um barco para sobreviver.', 85, 'Animação', 0, '/uploads/movies/flow.jpg'),
('Elio', 'Um garoto sonhador e obcecado por alienígenas é transportado por engano para uma organização intergaláctica e confundido com o embaixador da Terra.', 99, 'Animação', 0, '/uploads/movies/elio.jpg'),
('Carros', 'O ambicioso carro de corridas Relâmpago McQueen acaba perdido na pacata cidade de Radiator Springs, onde aprende o verdadeiro valor da amizade.', 117, 'Animação', 0, '/uploads/movies/carUm.webp'),
('Os Caras Malvados', 'Uma gangue de animais fora da lei tenta aplicar seu golpe mais difícil: fingir que se tornaram cidadãos exemplares para evitar a prisão.', 100, 'Animação', 0, '/uploads/movies/carasMalvados.webp'),
('Minions', 'Os pequenos seres amarelos buscam um novo mestre vilão para servir e acabam encontrando a ambiciosa Scarlet Overkill na década de 1960.', 91, 'Animação', 0, '/uploads/movies/minions.webp'),
('Gatto', 'Em Veneza, um gato preto endividado com o chefe da máfia felina local é forçado a formar uma amizade improvável para encontrar seu propósito.', 95, 'Animação', 0, '/uploads/movies/gatto.jpeg'),
('Toy Story', 'Um boneco caubói chamado Woody sente seu posto de brinquedo favorito ameaçado quando o moderno patrulheiro espacial Buzz Lightyear chega ao quarto.', 81, 'Animação', 0, '/uploads/movies/toyStory.jpg'),
('Guerreiras do K-Pop', 'As integrantes de um grupo global de K-pop levam vidas secretas como caçadoras de demônios para proteger seus fãs de ameaças sobrenaturais.', 96, 'Animação', 10, '/uploads/movies/guerreiraskpop.webp'),
('Gato de Botas', 'Antes de conhecer Shrek, o famoso felino fora da lei embarca em uma aventura ao lado de Humpty Dumpty e Kitty Pata-Mansa para roubar os ovos de ouro.', 90, 'Animação', 0, '/uploads/movies/gatoBotas.jpg'),
('Zootopia', 'Em uma metrópole de animais, uma coelha policial recém-formada e uma raposa vigarista precisam trabalhar juntas para desvendar uma conspiração.', 108, 'Animação', 0, '/uploads/movies/Zootopia.jpeg');

INSERT INTO SESSION (SHOW_TIME_SESSION, PRICE_SESSION, ID_MOVIE_FK, ID_ROOM_FK) VALUES
('2026-11-22 14:30:00', 32.50, 1, 1),
('2026-11-22 17:00:00', 32.50, 1, 1),
('2026-11-22 19:45:00', 40.00, 2, 2),
('2026-11-22 22:15:00', 40.00, 2, 2),
('2026-11-23 15:00:00', 28.00, 3, 1),
('2026-11-23 20:30:00', 45.90, 1, 3);

