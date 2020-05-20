function newElement(tagName, className) {
    const elem = document.createElement(tagName)
    elem.className = className
    return elem
}

function Barrier(reverse = false) {
    this.element = newElement('div', 'barrier')

    const theBorder = newElement('div', 'the-border')
    const theBody = newElement('div', 'the-body')
    this.element.appendChild(reverse ? theBody : theBorder)
    this.element.appendChild(reverse ? theBorder : theBody)

    this.setHeight = height => theBody.style.height = `${height}px`
}

// const b = new Barrier(true)
// b.setHeight(300)
// document.querySelector('[pm-flappy]').appendChild(b.element)

function PairOfBarriers(height, gap, xPosition) {
    this.element = newElement('div', 'pair-of-barriers')

    this.topSide = new Barrier(true)
    this.bottomSide = new Barrier(false)

    this.element.appendChild(this.topSide.element)
    this.element.appendChild(this.bottomSide.element)

    this.drawGap = () => {
        const topSideHeight = Math.random() * (height - gap)
        const bottomSideHeight = height - gap - topSideHeight
        this.topSide.setHeight(topSideHeight)
        this.bottomSide.setHeight(bottomSideHeight)
    }

    this.getX = () => parseInt(this.element.style.left.split('px')[0])
    this.setX = xPosition => this.element.style.left = `${xPosition}px`
    this.getWidth = () => this.element.clientWidth

    this.drawGap()
    this.setX(xPosition)
}

// const b = new PairOfBarriers(700, 400, 400)
// document.querySelector('[pm-flappy]').appendChild(b.element)

function Barriers(height, widthGame, verticalGap, horizontalGap, pointNotify) {
    this.pairs = [
        new PairOfBarriers(height, verticalGap, widthGame),
        new PairOfBarriers(height, verticalGap, widthGame + horizontalGap),
        new PairOfBarriers(height, verticalGap, widthGame + horizontalGap * 2),
        new PairOfBarriers(height, verticalGap, widthGame + horizontalGap * 3),
    ]

    const displacement = 3
    this.animate = () => {
        this.pairs.forEach(pair => {
            pair.setX(pair.getX() - displacement)

            // quando o elemento sair da area do jogo
            if (pair.getX() < -pair.getWidth()) {
                pair.setX(pair.getX() + horizontalGap * this.pairs.length)
                pair.drawGap()
            }

            const middle = widthGame / 2
            const crossedTheMiddle = pair.getX() + displacement >= middle
                && pair.getX() < middle
            if (crossedTheMiddle) pointNotify()
        })
    }
}

function Bird(gameHeight) {
    let flying = false

    this.element = newElement('img', 'bird')
    this.element.src = 'imgs/passaro.png'

    this.getY = () => parseInt(this.element.style.bottom.split('px')[0])
    this.setY = y => this.element.style.bottom = `${y}px`

    window.onkeydown = e => flying = true
    window.onkeyup = e => flying = false

    this.animate = () => {
        const newY = this.getY() + (flying ? 8 : -5)
        const maxHeight = gameHeight - this.element.clientHeight

        if (newY <= 0) {
            this.setY(0)
        } else if (newY >= maxHeight) {
            this.setY(maxHeight)
        } else {
            this.setY(newY)
        }
    }

    this.setY(gameHeight / 2)
}

// const barriers = new Barriers(500, 1200, 230, 400)
// const bird = new Bird(494)
// const gameArea = document.querySelector('[pm-flappy]')

// gameArea.appendChild(bird.element)
// barriers.pairs.forEach(pair => gameArea.appendChild(pair.element))
// setInterval(() => {
//     barriers.animate()
//     bird.animate()
// }, 20)

function Progress() {
    this.element = newElement('span', 'progress')
    this.attPoints = points => {
        this.element.innerHTML = points
    }
    this.attPoints(0)
}

function areOverlapping(elementA, elementB) {
    const a = elementA.getBoundingClientRect()
    const b = elementB.getBoundingClientRect()

    const horizontal = a.left + a.width >= b.left
        && b.left + b.width >= a.left
    const vertical = a.top + a.height >= b.top
        && b.top + b.height >= a.top
    return horizontal && vertical
}

function collided(bird, barriers) {
    let collided = false
    barriers.pairs.forEach(pairOfBarriers => {
        if (!collided) {
            const topSide = pairOfBarriers.topSide.element
            const bottomSide = pairOfBarriers.bottomSide.element
            collided = areOverlapping(bird.element, topSide)
                || areOverlapping(bird.element, bottomSide)
        }
    })
    return collided
}

function FlappyBird() {
    let points = 0

    const gameArea = document.querySelector('[pm-flappy]')
    const height = gameArea.clientHeight
    const width = gameArea.clientWidth

    const progress = new Progress()
    const barriers = new Barriers(height, width, 200, 400,
        () => progress.attPoints(++points))
    const bird = new Bird(height)

    gameArea.appendChild(progress.element)
    gameArea.appendChild(bird.element)
    barriers.pairs.forEach(pair => gameArea.appendChild(pair.element))

    this.start = () => {
        //game loop
        const timer = setInterval(() => {
            barriers.animate()
            bird.animate()
            if (collided(bird, barriers)) {
                clearInterval(timer)
            }
        }, 20)
    }
}

new FlappyBird().start()