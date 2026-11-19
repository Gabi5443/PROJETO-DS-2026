
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


INSERT INTO MOVIE (TITLE_MOVIE, SYNOPSIS_MOVIE, DURATION_MOVIE, GENRE_MOVIE, AGE_RATING_MOVIE, PHOTO_MOVIE) VALUES
('O Poderoso Chefão', 'O patriarca de uma dinastia do crime organizado transfere o controle de seu império clandestino para seu filho relutante.', 175, 'Drama, Crime', 14, 'wwwroot/uploads/movies/o_poderoso_chefao.jpg'),
('Interestelar', 'Uma equipe de exploradores viaja através de um buraco de minhoca no espaço na tentativa de garantir a sobrevivência da humanidade.', 169, 'Ficção Científica, Drama', 10, 'wwwroot/uploads/movies/interestelar.jpeg'),
('A Viagem de Chihiro', 'Durante a mudança para o subúrbio, uma menina de 10 anos entra em um mundo governado por deuses, bruxas e espíritos.', 125, 'Animação, Fantasia', 0, 'wwwroot/uploads/movies/viagem_de_chihiro.jpg'),
('Cidade de Deus', 'Nas favelas do Rio de Janeiro, dois rapazes seguem caminhos diferentes: um se torna fotógrafo e o outro um traficante.', 130, 'Drama, Crime', 18, 'wwwroot/uploads/movies/cidade_de_deus.jpg'),
('Batman: O Cavaleiro das Trevas', 'Com a ajuda de Jim Gordon e Harvey Dent, Batman tem que lidar com o caos instaurado em Gotham City pelo Coringa.', 152, 'Ação, Crime', 12, 'wwwroot/uploads/movies/cavaleiro_das_trevas.jpg'),
('Parasita', 'Toda a família de Ki-taek está desempregada e passa a se interessar pelo estilo de vida da rica família Park.', 132, 'Suspense, Drama', 16, 'wwwroot/uploads/movies/parasita.jpg'),
('Matrix', 'Um jovem programador é atormentado por estranhos pesadelos e descobre que o mundo em que vive é uma simulação.', 136, 'Ação, Ficção Científica', 14, 'wwwroot/uploads/movies/matrix.jpg'),
('Toy Story', 'Um boneco caubói fica profundamente ameaçado e com ciúmes quando um novo boneco astronauta o substitui como favorito.', 81, 'Animação, Comédia', 0, 'wwwroot/uploads/movies/toy_story.jpg'),
('Pulp Fiction: Tempo de Violência', 'As vidas de dois assassinos da máfia, um boxeador e um gângster se entrelaçam em quatro histórias de violência.', 154, 'Crime, Drama', 18, 'wwwroot/uploads/movies/pulp_fiction.jpg'),
('O Senhor dos Anéis: A Sociedade do Anel', 'Um manso hobbit do Condado e oito companheiros partem em uma jornada para destruir o poderoso Um Anel.', 178, 'Aventura, Fantasia', 12, 'wwwroot/uploads/movies/senhor_dos_aneis_1.jpg');

INSERT INTO MOVIE (TITLE_MOVIE, SYNOPSIS_MOVIE, DURATION_MOVIE, GENRE_MOVIE, AGE_RATING_MOVIE, PHOTO_MOVIE)
VALUES 
('Interestelar', 'Uma equipe de exploradores viaja através de um buraco de minhoca...', 169, 'Ficção Científica', 10, '/uploads/movies/interestelar.jpeg'),
('Batman', 'Após dois anos espreitando as ruas como Batman...', 176, 'Ação', 14, '/uploads/movies/batman.jpg');
