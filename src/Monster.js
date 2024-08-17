class Monster {
    constructor(monster_id, level, name, image, element) {
        this.monster_id = monster_id;
        this.level = level;
        this.name = name;
        this.image = "https://swarfarm.com/static/herders/images/monsters/"+image;
        this.element = element;
    }
}

export default Monster;
