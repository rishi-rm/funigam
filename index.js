const canvas = document.querySelector('.gameCanvas')
const ctx = canvas.getContext('2d')

canvas.width = 720
canvas.height = 1280

const groundHeight = 100

const playerImg = new Image()
playerImg.src = "assets/player.png"

const gameOverImg = new Image()
gameOverImg.src = "assets/gameover.png"

const obj1Img = new Image()
const obj2Img = new Image()

obj1Img.src = "assets/object1.png"
obj2Img.src = "assets/object2.png"

const objImages = [obj1Img, obj2Img]

let gameRunning = false
let isGameOver = false

const player = {
    width: 250,
    height: 250,
    x: canvas.width / 2 - 125,
    y: canvas.height - groundHeight - 240,
    speed: 6.5
}

const objects = []

const keys = {
    ArrowLeft: false,
    ArrowRight: false
}

let assetsLoaded = 0
const totalAssets = 4

function assetLoaded() {
    assetsLoaded++
    if (assetsLoaded === totalAssets) {
        initControls()
        gameLoop()
    }
}

playerImg.onload = assetLoaded
gameOverImg.onload = assetLoaded
obj1Img.onload = assetLoaded
obj2Img.onload = assetLoaded

const leftBtn = document.getElementById("leftBtn")
const rightBtn = document.getElementById("rightBtn")

function initControls() {

    // keyboard
    document.addEventListener("keydown", (e) => {
        if (e.key in keys) keys[e.key] = true

        if (e.key === "Enter") {
            startGame()
        }
    })

    document.addEventListener("keyup", (e) => {
        if (e.key in keys) keys[e.key] = false
    })

    // buttons
    leftBtn.addEventListener("touchstart", () => keys.ArrowLeft = true)
    leftBtn.addEventListener("touchend", () => keys.ArrowLeft = false)

    rightBtn.addEventListener("touchstart", () => keys.ArrowRight = true)
    rightBtn.addEventListener("touchend", () => keys.ArrowRight = false)

    leftBtn.addEventListener("touchcancel", () => keys.ArrowLeft = false)
    rightBtn.addEventListener("touchcancel", () => keys.ArrowRight = false)

    // tap anywhere to start / restart
    canvas.addEventListener("touchstart", (e) => {
        if (e.target === canvas) {
            if (!gameRunning || isGameOver) startGame()
        }
    })

    // mouse support
    canvas.addEventListener("click", () => {
        if (!gameRunning || isGameOver) startGame()
    })
}

function startGame() {
    objects.length = 0
    player.x = canvas.width / 2 - player.width / 2
    isGameOver = false
    gameRunning = true
}

function isColliding(a, b) {
    const padX = 70
    const padY = 40

    return (
        a.x + padX < b.x + b.width &&
        a.x + a.width - padX > b.x &&
        a.y + padY < b.y + b.height &&
        a.y + a.height - padY > b.y
    )
}

let spawnTimer = 0

function update() {
    if (!gameRunning) return
    if (isGameOver) return

    // spawn
    spawnTimer++
    if (spawnTimer > 50) {
        spawnObject()
        spawnTimer = 0
    }

    // move objects
    objects.forEach(obj => {
        obj.y += obj.speed
    })

    // remove off screen
    for (let i = objects.length - 1; i >= 0; i--) {
        if (objects[i].y > canvas.height) {
            objects.splice(i, 1)
        }
    }

    // movement
    if (keys.ArrowLeft) player.x -= player.speed
    if (keys.ArrowRight) player.x += player.speed

    // bounds
    if (player.x < 0) player.x = 0
    if (player.x + player.width > canvas.width) {
        player.x = canvas.width - player.width
    }

    // collision
    for (let obj of objects) {
        if (isColliding(player, obj)) {
            isGameOver = true
            gameRunning = false
        }
    }
}

function draw() {
    // sky
    ctx.fillStyle = "skyblue"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // ground
    ctx.fillStyle = "lightgreen"
    ctx.fillRect(0, canvas.height - groundHeight, canvas.width, groundHeight)

    // objects
    objects.forEach(obj => {
        ctx.drawImage(obj.img, obj.x, obj.y, obj.width, obj.height)
    })

    // player / game over
    if (isGameOver) {
        ctx.drawImage(gameOverImg, player.x, player.y + 20, player.width + 20, player.height - 20)
    } else {
        ctx.drawImage(playerImg, player.x, player.y, player.width, player.height)
    }

    // text
    ctx.fillStyle = "black"
    ctx.font = "30px Arial"
    ctx.textAlign = "center"

    if (!gameRunning && !isGameOver) {
        ctx.fillText("Tap Anywhere to Start", canvas.width / 2, canvas.height / 2)
    }

    if (isGameOver) {
        ctx.fillText("Tap Anywhere to Restart", canvas.width / 2, canvas.height / 2)
    }
}

function spawnObject() {
    const size = 60
    const imgIndex = Math.floor(Math.random() * objImages.length)

    objects.push({
        x: Math.random() * (canvas.width - size),
        y: -size,
        width: size,
        height: size,
        speed: 4.5 + Math.random() * 2,
        img: objImages[imgIndex]
    })
}

function gameLoop() {
    update()
    draw()
    requestAnimationFrame(gameLoop)
}