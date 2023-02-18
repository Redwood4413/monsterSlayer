const randomNum = (min, max) => {
  return Math.floor(Math.random() * (max - min) + min);
}
const checkForSpecAttack = (previous, ready) => {
  console.log(previous, ready)

  if (ready) return true;
}
const app = Vue.createApp({
  data() {
    return {
      gameState: {
        isEnded: false,
        playerTurn: true,
        round: 1,
      },
      player: {
        health: 100,
        level: 1,
        critChance: randomNum(5, 15),
        isDead: false,
      },
      monster: {
        health: 100,
        level: randomNum(1, 5),
        critChance: randomNum(5, 20),
        isDead: false,
      },
      specialAttack: {
        player: {
          ready: false,
          previous: 0,
        },
        monster: {
          ready: false,
          previous: 0,
        }
      },
      battleLog: []
    }
  },
  methods: {

    playerAttack(additionalDmg) {
      if (!this.gameState.playerTurn) return;
      let damage = 0;
      let crit = false;
      if ((Math.random() * 100) <= this.player.critChance) {
        damage = randomNum(5, 12) + 20;
        crit = true;
      } else {
        damage = randomNum(5, 12);
      }
      damage += additionalDmg;

      if (!this.specialAttack.player.ready) this.specialAttack.player.previous++;
      if (crit) {
        this.battlelog(`CRIT!: You deal ${damage} dmg to monster.`)
      } else {
        this.battlelog(`You deal ${damage} dmg to monster.`)
      }

      this.gameState.round++;
      this.monster.health -= damage;
      this.gameState.playerTurn = false;
      this.monsterAttack();

    },
    monsterAttack() {
      if (this.gameState.playerTurn) return;
      let damage = 0
      let crit = false;
      if ((Math.random() * 100) <= this.monster.critChance) {
        damage = randomNum(5, 12) + 20;
        crit = true;
      } else {
        damage = randomNum(5, 12) + this.monster.level;
      }

      setTimeout(() => {
        this.player.health -= damage;
        this.gameState.playerTurn = true;
        this.gameState.round++

        if (crit) {
          this.battlelog(`CRIT!: Monster deals ${damage} dmg to You.`)
        } else {
          this.battlelog(`Monster deals ${damage} dmg to You.`)
        }
      }, randomNum(300, 800));
    },
    launchSpecialAttack() {
      this.playerAttack(15); // call the function with additional damage for special attack
      this.specialAttack.player.ready = false;
      this.specialAttack.player.previous = 0;
    },
    battlelog(str) {
      this.battleLog.push(str);
    }
  },
  watch: {
    'specialAttack.player.previous'() {
      if (this.specialAttack.player.previous === 3) this.specialAttack.player.ready = true;

      checkForSpecAttack(this.specialAttack.player.previous, this.specialAttack.player.ready)
    }
  },
  computed: {
    playerHealthBar() {
      return {
        width: `${this.player.health}%`,
      }
    },
    monsterHealthBar() {
      return {
        width: `${this.monster.health}%`
      }
    },
    playerSpecAttackReady() {
      return checkForSpecAttack(this.specialAttack.player.previous, this.specialAttack.player.ready)
    },
  }
})

app.mount('#game')