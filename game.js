const canvas = document.querySelector('#game');
const game = canvas.getContext('2d');
const btnUp = document.querySelector("#up");
const btnDown = document.querySelector("#down");
const btnLeft = document.querySelector("#left");
const btnRight = document.querySelector("#right");
const spanLives = document.querySelector('#lives');
const spanTime = document.querySelector('#time');
const spanRecord = document.querySelector('#record');
const pResult = document.querySelector('#result');



let canvasSize;
let elementsSize;                                         
let level = 0;
let lives = 3;

let timeStart; 
let timePlayer;
let timeInterval;


const playerPosition = {
    x : undefined,
    y : undefined,
};

const giftPosition = {
    x : undefined,
    y : undefined,
};

let enemyPositions = [];


window.addEventListener('load', setCanvasSize);             // cada vez que se cargue la ventana ejecutamos el juego
window.addEventListener('resize', setCanvasSize);          // para acomodar cada vez que se achique o agrande la pantalla

function fixNumber (n) {                                  // esto puedo usarlo en las funciones de cualquier direccion para sacar todos los decimales y asi evitar los errores con decimales
    return Number(n.toFixed(2));        
}

// --------------------------- TAMAÑO DEL CANVAS ---------------------------
function setCanvasSize() {
    if(window.innerHeight > window.innerWidth) {        // si el alto es mayor al ancho, canvas = el ancho por 0.8, si no es asi, hago lo contrario para quedar igual
        canvasSize = window.innerWidth * 0.8;
    } else {
        canvasSize = window.innerHeight * 0.8;
    }

    canvasSize = Number(canvasSize.toFixed(0));         // cambiamos los decimales de string a Number, y le sacamos todos los decimales

    canvas.setAttribute('width', canvasSize);
    canvas.setAttribute('height', canvasSize);

    elementsSize = canvasSize / 10;                     // el -1 nos dara un espacio al final y las bombas se veran mas pequeñas y entraran todas

    playerPosition.x = undefined;
    playerPosition.y = undefined;
    startGame();                                       // Luego de ejecutarse la function setCanvasSize, se ejecutara startGame
}


// --------------------------- JUEGO ---------------------------
function startGame () {
    console.log({ canvasSize, elementsSize });

    game.font = elementsSize + 'px Verdana';            // el tamaño de los elementos mas Verdana el cual es el estilo de fuente
    game.textAlign = "end";

    const map = maps[level];                             
    
    if(!map) {                                          // si no hay mas mapa, ganamos el juego!
        gameWin();
        return;
    }
    
    if(!timeStart) {                                        // si no tiene ningun valor le asignaremos uno   
        timeStart = Date.now();                            // date.now() - timeStart nos dira el time exacto que paso desde que empezamos a jugar
        timeInterval = setInterval(showTime, 100);        // setInterval permite enviar otra funcion como argumento...  cada 100 milisegundo cambiara 
        showRecord();
    }
    
    const mapRows = map.trim().split('\n');         //trim limpia los espacios en blanco al principio o al final, con eso mas limpio, creamos un array donde el inicio y el final de cada elemento es cuando hay un salto de linea usando split
    const mapRowCols = mapRows.map(row => row.trim().split(''));// limpiara los espacios de la fila de string con trim, y con split separara con un salto de linea cada elemento, haciendo que las coordenadas del mapa sean eso, coordenadas
    console.log({map, mapRows, mapRowCols});

    showLives();                                                      

    enemyPositions = [];                                            // al ponerlo aca, no se sumara de nuevo los elementos bombas 
    game.clearRect(0,0,canvasSize, canvasSize);                    // antes de hacer cada uno de los render estamos borrando todo

    mapRowCols.forEach((row, rowI) => {
        row.forEach((col, colI) => {
          const emoji = emojis[col];
          const posX = elementsSize * (colI + 1);              
          const posY = elementsSize * (rowI + 1); 

          if (col == 'O') {                                 // si columna es igual a O, aqui va nuestro jugador
            if (!playerPosition.x && !playerPosition.y) {  // si hay algo en esas coordenadas playerposition, si hay algo no hago nada, si no hay nada creo la posicion de nuestro jugador en la columna en la que estemos
                playerPosition.x = posX;
                playerPosition.y = posY;
                //console.log({playerPosition});
            }
          } else if (col == 'I') {                      
            giftPosition.x = posX;
            giftPosition.y = posY;
          } else if ( col == 'X') {                      
            enemyPositions.push ({                     // Con el metodo push estamos mutando un array, le decimos que agregaremos mas elementos
                x: posX,
                y: posY,
            });
          }
            
          game.fillText(emoji, posX, posY);         // con fill le damos algun contenido
        });
      });

      movePlayer(); 
      
      /**
     * mapRowCols es el array bidimensional a partir del strin de nuestro mapa
     * por cada fila e indice de fila
     * a partir de cada una de las filas(row.forEach) recorremos la columna y al indice
     * encontramos al emojis dependiendo de cual sea ese emoji en el array de columna
     * en posX multimplicamos el tamaño de nuestros elementos por lo q contenga nuestro indice +1
     * al final ponemos 1.2 y 0.8 para que nos quede ese espacio, de lo contrario saldria de la pantalla
     */
}


// --------------------------- MOVIMIENTO DEL JUGADOR ---------------------------
function movePlayer () {
    const giftCollisionX = playerPosition.x.toFixed(5) == giftPosition.x.toFixed(5); // toFixed(5) saca los decimales y solo deja 5 para que no nos de error en caso de no coincidir con los otros decimales
    const giftCollisionY = playerPosition.y.toFixed(5) == giftPosition.y.toFixed(5);
    const giftCollision = giftCollisionX && giftCollisionY;

    if (giftCollision) {                  
        levelWin();                                  // Si hay colision subimos de nivel y cambiamos de pantalla llamando a la funciton levelWin el cual contiene el array maps qeu contiene a level++
        console.log('Subiste de nivel!!!');         // <----- esto es opcional
    }

    const enemyCollision = enemyPositions.find(enemy => {
        const enemyCollisionX = enemy.x.toFixed(5) == playerPosition.x.toFixed(5); // si el enemigo en la posicion x es igual a la posicion del player, colisionamos
        const enemyCollisionY = enemy.y.toFixed(5) == playerPosition.y.toFixed(5);
        return enemyCollisionX && enemyCollisionY;
    })

    if (enemyCollision) {                                                    // Si hay colision volvemos al punto de partida
        levelFail();
        console.log('Perdiste, has chocado con una Bomba!!!');
    }

    game.fillText(emojis['PLAYER'], playerPosition.x, playerPosition.y); // con esto encontramos al player, es decir que renderizamos al emoji para que se pueda ver
}



function levelWin() {
    console.log('Flecidades! Has subido de Nivel!!!');
    level++;                                               // se incrementara el array maps cada vez que pasemos el nivel
    startGame();                                           // luego llamara a la function startGame que contendra el juego de nuevo 
}
function levelFail() {
    console.log('Chocaste contra un enemigo :(');
    lives--;

    

    console.log('Tienes ', lives,' Vida');
  
    if (lives <= 0) {
        level = 0;
        lives = 3;
    }

    playerPosition.x = undefined;
    playerPosition.y = undefined;
    startGame();


}

function gameWin() {
    console.log('Terminaste el Juego !!!');
    clearInterval(timeInterval);

    const recordTime = localStorage.getItem('record');
    const playerTime = Date.now() - timeStart;

    if (recordTime) {
        if (recordTime >= playerTime) {
            localStorage.setItem('record', playerTime);
            pResult.innerHTML = 'SUPERASTE EL RECORD!!!';
        } else {
            pResult.innerHTML = 'No pudiste superar el Record! Intentalo de nuevo !';
        } 
    } else {
        localStorage.setItem('record', playerTime);
        pResult.innerHTML = 'primera vez jugando?';
    }

    console.log({recordTime, playerTime});
}


function showLives () {
    const heartsArray = Array(lives).fill(emojis['HEART']);  // con fill le damos a cada una de esas posiciones del array algun contenido
    console.log(heartsArray);                               // con Array creamos otro array de vidas y pondremos el emoji corazon

    spanLives.innerHTML = emojis["HEART"].repeat(lives)
}

function showTime() {
    spanTime.innerHTML = Date.now() - timeStart;
}

function showRecord() {
    spanRecord.innerHTML = localStorage.getItem('record');
}

// --------------------------- BOTONES DIRECCIONALES ---------------------------
window.addEventListener('keydown', moveByKeys);    // el navegador al escuchar una tecla 
btnUp.addEventListener('click', moveUp);
btnDown.addEventListener('click', moveDown);
btnLeft.addEventListener('click', moveLeft);
btnRight.addEventListener('click', moveRight);



function moveByKeys(event) {                     // al escuchar mostrara un evento que dira en que direccion se movio
    if (event.key == 'ArrowUp') {               //ArrowUp son las flechas del teclado
        moveUp();
    } else if (event.key == 'ArrowDown') {
        moveDown();
    } else if (event.key == 'ArrowLeft') {
        moveLeft();
    } else if (event.key == 'ArrowRight') {
        moveRight();
    }
}

function moveUp() {
    console.log(' Me quiero mover hacia arriba');
    if ((playerPosition.y) < elementsSize) { // elementSize es el punto de inicio del juego, en cada fila y en cada columna
        console.log("OUT");
    } else {
        playerPosition.y -= elementsSize;      // a la izquierda restaremos, si es hacia la derecha sumaremos
        startGame();                          // se resetea por medio de "game.clearRect" y luego llama a la funcion movePlayer
    }    
}

function moveDown() {
    console.log(' Me quiero mover hacia abajo');
    if ((playerPosition.y + elementsSize) > canvasSize) {
        console.log("OUT");
    } else {
        playerPosition.y += elementsSize;    
        startGame();                        // cuando llegamos al final del cuadrado(canvas) y queremos seguir, queda un espacio, este espacio es +40, es el espacio q queda del emoji de la calavera, y como nuestro canvas tiene 400, no aceptara un "+440"
    }
}

function moveLeft() {
    console.log(' Me quiero mover hacia izquierda');
    if ((playerPosition.x) < elementsSize) {
        console.log("OUT");
    } else {
        playerPosition.x -= elementsSize; 
        startGame(); 
    }
}

function moveRight() {
    console.log(' Me quiero mover hacia derecha');
    if ((playerPosition.x + elementsSize) > canvasSize) { // si el jugador + tamaño del elemento es mayor al canvas, se parara
        console.log("OUT");
    } else {
        playerPosition.x += elementsSize; 
        startGame(); 
    }
}






 /*                                     OTRA MANERA DE HACER EL CICLO FOR
    //                  los canvas empiezan en 1 y los array en 0, por eso le agregamos un -1
    for (let row = 1; row < 10; row++) { // la X es la bomba del objeto emojis
        for (let col = 1; col <= 10; col++) { // si ponemos un 2 eliminara la columna 1
            game.fillText(emojis[mapRowCols[row - 1][col -1]], elementsSize * col,  elementsSize * row); // multiplicamos el tamaño de los elementos por 10
        }
    }
    //game.fillRect(0,50,100,100); // fill nos ayuda a insertar un cuadrado, mover el cuadrado
    //game.clearRect(20,50,10,10); // espacio lateral, espacio vertical, anchura, altura
    */