const randomNum = (min, max) => {
  return Math.floor(Math.random() * (max - min) + min);
}

const app = Vue.createApp({
  data() {
    return {
      gameState: {
        isEnded: false,
        playerTurn: true,
        round: 1,
        counter: 3,
      },
      player: {
        health: 100,
        level: 1,
        critChance: randomNum(5, 15),
        isDead: false,
        isAbleToHeal: false,
        isAbleToRetreat: false,
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
      if (this.monster.health <= 0) this.monster.isDead = true;
      this.gameState.playerTurn = false;
      if (!this.monster.isDead) this.monsterAttack();
    },
    monsterAttack() {
      if (this.monster.isDead) return;
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
    restartTheGame() {
      this.gameState.isEnded = false;
      this.gameState.playerTurn = true;
      this.gameState.round = 1;

      this.player.health = 100;
      this.player.level = 1;
      this.player.critChance = randomNum(5, 15);
      this.player.isDead = false;

      this.monster.health = 100;
      this.monster.level = randomNum(1, 5);
      this.monster.critChance = randomNum(5, 15);
      this.monster.isDead = false;

      this.specialAttack.player.ready = false;
      this.specialAttack.player.previous = 0;

      this.specialAttack.monster.ready = false;
      this.specialAttack.monster.previous = 0;

      this.battleLog = [];
    },
    findNewMonster() {
      this.gameState.isEnded = false;
      this.gameState.playerTurn = true;
      this.gameState.round = 1;

      this.player.health += 40;
      this.player.level += 1;

      this.monster.health = 100;
      this.monster.level = randomNum(1, 5);
      this.monster.critChance = randomNum(5, 15);
      this.monster.isDead = false;

      this.specialAttack.player.ready = false;
      this.specialAttack.player.previous = 0;

      this.specialAttack.monster.ready = false;
      this.specialAttack.monster.previous = 0;
    },
    launchSpecialAttack() {
      this.playerAttack(15); // call the function with additional damage for special attack
      this.specialAttack.player.ready = false;
      this.specialAttack.player.previous = 0;
    },
    battlelog(str) {
      this.battleLog.push(str);
    },
    healPlayer() {
      this.gameState.playerTurn = false;
      const healValue = randomNum(10, 20) + this.player.level * 3;
      this.player.health += healValue;
      if (this.player.health >= 100) this.player.health = 100;

      this.battlelog(`You're healing yourself for ${healValue} hp.`)
      this.monsterAttack();
    },
    retreat() {
      this.gameState.playerTurn = true;
      this.gameState.isEnded = true;

      const value = randomNum(20, 30);
      this.monster.health += value
      this.player.health += 30;

      this.battlelog(`You've retreated, monster heals for ${value}HP, and You for 30HP.`)
      setInterval(() => {
        this.gameState.counter--

        if (this.gameState.counter === 0) {
          this.gameState.isEnded = false;
          this.gameState.counter = 3;
          this.gameState.round = 1;
          return;
        }
      }, 1000);
    }
  },
  watch: {
    'specialAttack.player.previous'() {
      if (this.specialAttack.player.previous === 3) this.specialAttack.player.ready = true;
    },
    'player.health'() {
      if (this.player.health <= 30) {
        this.player.isAbleToHeal = true;
        this.player.isAbleToRetreat = true;
      } else {
        this.player.isAbleToHeal = false;
        this.player.isAbleToRetreat = false;
      };
      if (this.player.health <= 0) {
        this.player.isDead = true;
        this.gameState.isEnded = true;
        this.player.health = 0;
      };
    },
    'monster.health'() {
      if (this.monster.health <= 0) {
        this.monster.isDead = true;
        this.gameState.isEnded = true;
        this.monster.health = 0;
        console.log(this.monster.isDead)
      }
    }
  },
  computed: {
    playerHealthBar() {
      if (this.player.health <= 0) {
        return { width: `${0}%` };
      }
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
      if (this.specialAttack.player.ready) return true;
    },
  }
})

app.mount('#game')