<template>
  <div class="calculator">
    <div class="calculator__inputs">
      <div class="type-window">
        <h2 class="type-window__title">Тип окна</h2>
        <div class="type-window__group" v-for="(group, indG) in groups" :key="indG">
          <div :class="{ 'type-window__current': true, 'type-window__current_active': selectedGroup === indG }" :title="group.name">
            <img :src="'./windows/p'+(indG+1)+'_' + (group.selected ? (group.selected + 1) : 1) +'.png'">
            <div class="type-window__items">
              <div :class="{ 'type-window__item': true, 'type-window__item_active': group.selected === indI }" v-for="(item, indI) in group.items" :key="indI" @mousedown="setGroup(group, indI, indG)">
                <img :src="'./windows/p'+(indG+1)+'_'+(indI+1)+'.png'" :alt="item.type" :title="item.type">
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="window">
        <vue-slider :direction="'vertical'" :height="370" :width="25" :min="minHeight" :max="maxHeight" v-model.number="height" class="ranger ranger_vertical"></vue-slider>
        <div class="window__preview" @click="changeType" ref="preview">
          <img :src="previewMainImage(slugItem)">
          <template v-for="(layer, ind) in layers">
            <img :src="layer.image"  alt="" :class="['preview-layer', 'preview-layer_' + layer.pos]">
            <div :class="['type-window__mosquito', 'type-window__mosquito_'+layer.pos]" v-if="isHaveMosquito(layer.price)" :style="{ left: ((100/currentItem.countChoice)*ind + (100 / (currentItem.countChoice * 2))+'%') }" :key="ind">
              <input type="checkbox" :id="'mosquito_'+layer.pos" v-model="mosquito[layer.pos]">
              <label :for="'mosquito_'+layer.pos">
                Москитная сетка
              </label>
            </div>
          </template>
        </div>
        <vue-slider :height="25" :width="250" :min="minWidth" :max="maxWidth" v-model.number="width" class="ranger ranger_horizontal"></vue-slider>
        <div class="window__mouse"><img :src="'./images/left-click-with-a-mouse.svg'" width="32px">*Нажмите на створку, чтобы изменить тип открывания</div>
      </div>
      <div class="params">
        <div class="params__group">
          <div class="params__col">
            <div class="params__row">
              <input id="height" :value="height" @change="height = +$event.target.value" :min="minHeight" :max="maxHeight" class="number-field" size="1">
              <label for="height" class="params__label">высота, см</label>
            </div>
          </div>
          <div class="params__separator">X</div>
          <div class="params__col">
            <div class="params__row">
              <input id="width" :value="width" @change="width = +$event.target.value" :min="minWidth" :max="maxWidth" class="number-field" size="1">
              <label for="width" class="params__label">ширина, см</label>
            </div>
          </div>
        </div>
        <div class="params__group">
          <div class="params__col">
            <div class="params__row" v-if="'Комплектующие' in other">
              <input type="checkbox" id="complects" v-model="complectation">
              <label for="complects">Комплектующие</label>
            </div>
            <div class="params__row" v-if="'Ламинация' in other">
              <compact-picker :colors="other['Ламинация']" @change="setLamination" :default_color="lamination"></compact-picker>
              <label for="lamination">Ламинация</label>
            </div>
          </div>
          <div class="params__col">
            <div class="params__row">
              <label for="profile">Профиль:</label>
              <select id="profile" v-if="'Скидка' in other" v-model="profile">
                <option :value="ind" v-for="(name, ind) in other['Скидка']" :selected="ind === 0" :key="ind">{{ ind }}</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="calculator__info">
      <div class="price-block">
        <div class="price-block__head">
          <h2 class="price-block__title">Стоимость</h2>
          <span class="price-block__value price-block__value_old" v-if="'Скидка' in other && discount !== 0">{{ priceObj.oldPrice * qt }} &#8381;</span>
          <div class="price-result">
            <div class="price-result__total">{{ priceObj.newPrice * qt }} &#8381;</div>
            <div class="price-result__components">
              <p v-if="'Стоимость монтажа' in this.other">Монтаж: {{ priceInstallation }} &#8381;</p>
              <p v-if="'Стоимость отделки под ключ' in this.other">Отделка: {{ priceTrimming }} &#8381;</p>
            </div>
          </div>
        </div>
        <div class="price-block__info">
          В рассрочку: {{ Math.ceil(priceObj.newPrice * qt / 12) }} &#8381; в месяц!
        </div>
        <div class="price-block__controls">
          <div class="price-block__qt">
            <number-input controls inline center :min="1" :max="100" :value="1" v-model="qt"></number-input>
            <span class="price-block__unit">шт.</span>
          </div>
          <div class="price-block__buttons">
            <button class="price-block__add button" @click="addCalculation">
              <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Capa_1" x="0px" y="0px" viewBox="0 0 26 26" style="enable-background:new 0 0 26 26;" xml:space="preserve" >
                <g>
                  <path d="M25.856,10.641C21.673,19.5,20.312,19.5,19.5,19.5h-8c-2.802,0-4.949-1.648-5.47-4.2   c-0.016-0.078-1.6-7.853-2.005-10.025C3.826,4.21,3.32,3.5,1.5,3.5C0.671,3.5,0,2.829,0,2s0.671-1.5,1.5-1.5   c3.02,0,4.964,1.5,5.474,4.224c0.401,2.149,1.98,9.898,1.996,9.977c0.319,1.566,1.722,1.8,2.53,1.8h7.605   c0.817-0.878,2.679-4.261,4.038-7.141c0.354-0.749,1.249-1.068,1.997-0.716C25.89,8.997,26.21,9.891,25.856,10.641z M10.5,20.5   C9.119,20.5,8,21.619,8,23s1.119,2.5,2.5,2.5S13,24.381,13,23S11.881,20.5,10.5,20.5z M19.5,20.5c-1.381,0-2.5,1.119-2.5,2.5   s1.119,2.5,2.5,2.5S22,24.381,22,23S20.881,20.5,19.5,20.5z M14.663,12.344c0.1,0.081,0.223,0.12,0.346,0.12   s0.244-0.039,0.346-0.12c0.1-0.079,2.828-2.74,4.316-4.954c0.115-0.172,0.126-0.392,0.028-0.574   c-0.095-0.181-0.285-0.295-0.49-0.295h-2.226c0,0-0.217-4.291-0.359-4.49c-0.206-0.294-1.057-0.494-1.616-0.494   c-0.561,0-1.427,0.2-1.634,0.494c-0.141,0.198-0.328,4.49-0.328,4.49h-2.255c-0.206,0-0.395,0.114-0.492,0.295   c-0.097,0.182-0.086,0.403,0.028,0.574C11.816,9.605,14.564,12.265,14.663,12.344z" fill="#FFFFFF"/>
                </g>
              </svg>
              <span>Добавить в расчет</span>
            </button>
          </div>
        </div>
        <div class="discount" v-if="'Скидка' in other && discount !== 0">
          <span class="discount__value">{{ discount }}<span class="discount__unit"> %</span></span>
          <span class="discount__text">Скидка</span>
        </div>
      </div>
      <transition name="fade">
        <div class="calculations" v-if="calculations.length > 0">
          <h2 class="calculations__title">Ваш расчет</h2>
          <div class="calculations__list">
              <transition-group name="list" tag="p">
                <div class="calculations__item" v-for="(calc, ind) in calculations" :key="calc.id">
                  <div class="calculations__image">
                    <div class="calculations__preview">
                      <img :src="previewMainImage(calc.slug)">
                      <template v-for="(layer, ind) in calc.layers">
                        <img :src="layer.image"  alt="" :class="['preview-layer', 'preview-layer_' + layer.pos]">
                      </template>
                    </div>
                  </div>
                  <div class="calculations__qt">x{{ calc.count }}</div>
                  <div class="calculations__params">
                    <p>{{ calc.group }} {{ calc.height }} X {{ calc.width }}</p>
                    <p v-if="calc.profile">Профиль: {{ calc.profile }}</p>
                    <p v-if="calc.mosquito.length > 0">Москитная сетка: {{ calc.mosquito.toString() }}</p>
                    <p>Цена: {{ calc.price }} x {{ calc.count }} = <b>{{ calc.count * calc.price }}</b></p>
                    <template v-if="'Ламинация' in other">
                      <p v-if="calc.lamination && calc.lamination.color !== '#ffffff'">Цвет ламинации: {{ calc.lamination.title }}</p>
                      <p v-else>Без ламинации</p>
                    </template>

                  </div>
                  <div class="calculations__button">
                    <a href="#" class="calculations__delete" @click.prevent="deleteCalculation(ind)">Удалить</a>
                  </div>
                </div>
              </transition-group>
          </div>
          <div class="calculations__results">
            <label class="calculations__total-label">Итого:</label>
            <div class="price-result">
              <div class="price-result__total">{{ totalPrice }} &#8381;</div>
              <div class="price-result__components">
                <p v-if="'Стоимость монтажа' in this.other">Монтаж: {{ totalPriceInstallation }} &#8381;</p>
                <p>Отделка: {{ totalPriceTrimming }} &#8381;</p>
              </div>
            </div>
          </div>
          <div class="calculations__submit">
            <p class="calculations__want">Хотите еще дешевле? Отправьте расчет прямо сейчас и получите дополнительную скидку!</p>
            <button class="calculator__submit button" @click.prevent="sendForm">Отправить расчет</button>
            <p class="calculations__recall">Перезвоним в течение 5 минут!</p>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script lang="ts">
  import {
    Component,
    Vue,
    Prop
} from 'vue-property-decorator';

import CompactPicker from './components/compact-picker.vue';

var VueNumberInput = require('@chenfengyuan/vue-number-input').default;
var vueSlider = require('vue-slider-component');

// Interfaces
interface INameToValueMap {
    [key: string]: any;
}
interface IItem {
    [key: string]: any;
    type: string;
    countChoice: number;
    slug: string;
    slugParent: string;
    default: INameToValueMap;
    values: INameToValueMap;
    formula: string;
}
interface IGroup {
    [key: string]: any;
    name: string;
    slug: string;
    maxWidth: number;
    maxHeight: number;
    minWidth: number;
    minHeight: number;
}
interface ICalculation {
    id?: number;
    count?: number;
    price?: number;
    oldprice?: number;
    group?: string;
    profile?: string;
    mosquito?: Array<INameToValueMap>;
    width?: number;
    height?: number;
    slug?: string;
    lamination?: INameToValueMap;
    complectation?: boolean;
    priceInstallation?: number;
    priceTrimming?: number;
    types?: INameToValueMap;
    layers?: INameToValueMap;
}
interface IPosition {
    left?: any;
    center?: any;
    right?: any;
    [key: string]: any;
}

@Component({
    components: {
        vueSlider,
        "number-input": VueNumberInput,
        'compact-picker': CompactPicker
    },
})
export default class App extends Vue {
    // Props
    @Prop({
        type: Array
    }) private groups!: any;
    @Prop({
        type: Array
    }) private prices!: any;
    @Prop({
        type: Object
    }) private other!: any;

    // Data
    width = 120;
    height = 35;
    complectation: boolean = false;
    lamination: INameToValueMap = { 'color': '#ffffff', 'title': 'Белый' };
    selectedGroupItem = 0;
    selectedGroup = 0;
    loaded: boolean = false;
    profile: string = "";
    qt: number = 1;

    // Settlement list
    calculations: Array<ICalculation> = new Array<ICalculation>();
    // Type windows
    type: INameToValueMap = {
        "left": 1,
        "center": 1,
        "right": 1
    };

    mosquito: INameToValueMap = {
        "left": false,
        "center": false,
        "right": false
    };

    // Computed

    // Get sizes of selected group
    get maxWidth() {
        return this.currentGroup.maxWidth || 120;
    }

    get maxHeight() {
        return this.currentGroup.maxHeight || 220;
    }

    get minWidth() {
        return this.currentGroup.minWidth || 35;
    }

    get minHeight() {
        return this.currentGroup.minHeight || 35;
    }

    get slugGroup() {
        if (this.currentItem['slugParent']) {
            return this.currentItem['slugParent'];
        }
        return this.currentGroup.slug;
    }

    get slugItem() {
        return this.currentItem.slug;
    }

    get countDefaultTypes() {
        var item: IItem = this.currentItem;
        var maxes: INameToValueMap = {
            "left": 5,
            "center": 5,
            "right": 5
        };

        if ('values' in item) {
            for (var pos in maxes) {
                if (pos in item['values']) {
                    maxes[pos] = item['values'][pos].length;
                }
            }

        }
        return maxes;
    }

    get currentGroup() {
        if (this.groups) {
            return this.groups[this.selectedGroup];
        }
    }

    get currentItem() {
        var group: IGroup = this.currentGroup;
        return group.items[this.selectedGroupItem];
    }

    get layers() {
        var item: IItem = this.currentItem;
        var layers = [];

        for (var i = 0; i < item.countChoice; i++) {
            var layer: any = {};

            var positions = this.getPositions(item);
            layer.pos = positions[i];

            layer.image = './windows/' + this.slugGroup + '-' + layer.pos[0] + '-' + this.type[layer.pos] + '.png'
            layer.type = this.type[layer.pos];

            var allowPrices = this.getGroupItemTypes(item);
            var priceName = allowPrices[layer.pos][this.type[layer.pos] - 1];
            var price = this.pricesObject[priceName];

            layer.price = price;

            layers.push(layer);
        }
        
        return layers;
    }

    get area() {
        return (this.width / 100) * (this.height / 100);
    }

    get formula() {
        var def = "$площадь * ($левое_окно + $центральное_окно + $правое_окно) / $количество_окон ";
        var item: IItem = this.currentItem;

        return item.formula || def;
    }

    get pricesObject() {
        var prObj: INameToValueMap = {};
        for (var i in this.prices) {
            var price = this.prices[i];
            var profile = this.profile;

            prObj[price['name']] = price;
        }
        return prObj;
    }

    get totalPrice() {
        return this.calculations.reduce((sum, cur) => {
            return sum + cur.price * cur.count;
        }, 0);
    }

    get totalPriceInstallation() {
        return this.calculations.reduce((sum, cur) => {
            return sum + cur.priceInstallation;
        }, 0);
    }

    get totalPriceTrimming() {
        return this.calculations.reduce((sum, cur) => {
            return sum + cur.priceTrimming;
        }, 0);
    }

    get discount() {
        if (this.profile in this.other['Скидка']) {
            return this.other['Скидка'][this.profile];
        }
        else {
            return 0;
        }
    }

    get priceInstallation() {
        return Math.ceil(this.other['Стоимость монтажа'] * this.area) * this.qt;
    }

    get priceTrimming() {
        return Math.ceil(this.other['Стоимость отделки под ключ'] * ((this.width + this.height) / 50)) * this.qt;
    }

    get priceObj() {
        var positions = this.getPositions(this.currentItem);
        var sumPos = 0;
        var area = this.area;
        var posPrice: INameToValueMap = { "left": 0, "center": 0, "right": 0 };
        var mosquitoSum = 0;

        for (var i in positions) {
            var pos = positions[i];

            var selectedTypeId = this.type[pos];

            var allowPrices = this.getGroupItemTypes(this.currentItem);
            var priceName = allowPrices[pos][selectedTypeId - 1];
            var price = this.pricesObject[priceName];
            if (this.mosquito[pos] && 'mosquito' in price) {
                mosquitoSum += price['mosquito'];
            }

            posPrice[pos] = price['prices'][this.profile];
        }

        var formula = this.formula;

        formula = formula.split('$').join('_.');

        var func = new Function("_", "return " + formula);

        var params = {
            "ширина": this.width / 100,
            "высота": this.height / 100,
            "количество_окон": positions.length,
            "площадь": area,
            "левое_окно": posPrice['left'],
            "правое_окно": posPrice['right'],
            "центральное_окно": posPrice['center']
        };

        var result = func(params);

        // other results

        // Complectation
        if (this.complectation && 'Комплектующие' in this.other) {
            result += this.other['Комплектующие'] * this.area;
        }

        if ('ЛаминацияЦена' in this.other && this.lamination.color !== '#ffffff') {
            result += this.other['ЛаминацияЦена'];
        }

        result += mosquitoSum;

        //result -= result * this.discount / 100;
        return {
            "oldPrice": ~~(result),
            "newPrice": ~~(result - result * this.discount / 100)
        }
    }

    // Methods
    previewMainImage(slug: string) {
        return './windows/' + slug + '.png';
    }

    isHaveMosquito(price: any) {
        return 'mosquito' in price;
    }

    setLamination(color: string, colorTitle: string) {
        this.lamination = {
            'color': color,
            'title': colorTitle
        }
    }

    deleteCalculation(ind: number) {
        this.calculations.splice(ind, 1);
    }

    filterWindows(windows: IPosition) {
        var countWindows = this.currentItem.countChoice;
        if (countWindows === 1) {
            return {
                'center': windows['center']
            }
        } else if (countWindows === 2) {
            return {
                'left': windows['left'],
                'right': windows['right']
            }
        }
        return windows;
    }

    addCalculation() {
        var allowPrices: INameToValueMap = this.filterWindows(this.getGroupItemTypes(this.currentItem));
        for (var pos in allowPrices) {
            allowPrices[pos] = allowPrices[pos][this.type[pos] - 1];
        }

        var mosquitoTitle: INameToValueMap = this.filterWindows({
            'left': ' на левое',
            'center': ' на центральное',
            'right': ' на правое'
        });
        var mosquito = [];
        for (var m in this.mosquito) {
            if (this.mosquito[m]) {
                mosquito.push(mosquitoTitle[m]);
            }
        }

        var calc: ICalculation = {
            id: this.calculations.length,
            count: this.qt,
            price: this.priceObj.newPrice,
            oldprice: this.priceObj.oldPrice,
            group: this.currentGroup.name,
            profile: this.profile,
            mosquito: mosquito,
            width: this.width,
            height: this.height,
            lamination: this.lamination,
            complectation: this.complectation,
            priceInstallation: this.priceInstallation,
            priceTrimming: this.priceTrimming,
            types: allowPrices,
            slug: this.slugItem,
            layers: this.layers
        };
        this.calculations.push(calc);
    }

    getPositions(item: IItem) {
        var positions = ["left", "center", "right"];

        if (item.countChoice === 1) {
            return ["center"];
        } else if (item.countChoice === 2) {
            return ["left", "right"];
        }
        return positions;
    }

    changeType(e: MouseEvent) {
        var element = e.target as HTMLElement;
        if (element.tagName !== 'IMG') {
            return;
        }
        var maxes = this.countDefaultTypes;
        var pos = 'center';
        var item: IItem = this.currentItem;

        if (item.countChoice > 1) {
            var mouseX = e.offsetX;

            var elPreview: HTMLElement = (<HTMLElement>this.$refs['preview']);
            var width = elPreview.clientWidth;

            var point = mouseX / (width / item.countChoice);
            var i = Math.floor(point);
            pos = this.getPositions(item)[i];
        }
        if (this.type[pos] >= maxes[pos]) {
            this.type[pos] = 1;
        } else this.type[pos] += 1;
    }

    getGroupItemTypes(item: any) {
        var defaultTypes = ["глухое",
            "поворотное-Л",
            "поворотное-откидное-Л",
            "поворотное-П",
            "поворотное-откидное-П"
        ];
        var positions: IPosition = {
            "left": defaultTypes.slice(),
            "center": defaultTypes.slice(),
            "right": defaultTypes.slice()
        };
        if ('values' in item) {
            for (var pos in positions) {
                if (pos in item['values']) {
                    positions[pos] = item['values'][pos];
                }
            }
        }
        return positions;
    }

    setGroup(group: IGroup, indI: number, indG: number): void {
        this.selectedGroupItem = indI;
        this.selectedGroup = indG;
        this.$set(group, 'selected', indI);

        if ('default' in group.items[indI]) {
            var def = group.items[indI]['default'];
            var types = this.getGroupItemTypes(group.items[indI]);

            for (var pos in def) {
                var name = def[pos];
                var ind = types[pos].indexOf(name);

                if (ind >= 0) {
                    this.type[pos] = ind + 1;
                }
            }
        }
        // Reset mosquito
        for (var i in this.mosquito) {
            this.mosquito[i] = false;
        }
    }

    mounted() {
        if ('Скидка' in this.other) {
            var profileName = Object.keys(this.other['Скидка'])[0];
            var profilePrice = this.other['Скидка'][profileName];
            this.profile = profileName;
        }
    }

    sendForm() {
        (<any>window)['base'].$emit('send_form', this.calculations); // Используем для события родительский компонент, т.к. текущий доступен через children
    }
}
</script>
<style lang="scss">
  html {
    font-size: 16px;
  }
</style>
<style lang="scss" scoped>
  @import url('https://fonts.googleapis.com/css?family=PT+Sans&subset=cyrillic,cyrillic-ext');
  $assetPath : "~/images";

  
  $primary-color: #3498db;
  $text-color: white;
  $breakpoint-tablet: 1120px;
  $breakpoint-mobile: 480px;
  $price-color: #e11300;
  .calculator {
    display: flex;
    background: #f3f3f3;
    font-family: 'PT Sans', sans-serif;
    max-width: 1100px;
    margin: 0 auto;
    padding: 5px;
    box-sizing: border-box;
    flex-wrap: wrap;
    justify-content: space-around;
    align-items: flex-start;
    &__inputs {
      display: flex;
      flex-wrap: wrap;
      flex-basis: 540px;
      margin-bottom: 30px;
      flex-grow: 2;
      justify-content: center;
      user-select: none;
    }
    &__info {
      flex-basis: 410px;
      flex-grow: 2;
    }
  }
  .type-window {
    width: 130px;
    &__title {
      margin-top: 0px;
    }
    &__group {
      position: relative;
      margin-bottom: 15px;
    }
    &__items {
      display: none;
      position: absolute;
      background: white;
      top: -11px;
      left: -11px;
      z-index: 15;
      padding: 10px;
      border: 1px solid #ccc;
    }
    &__item {
      display: inline-block;
      margin-right: 20px;
      border: 3px solid transparent;
      line-height: 0;
      &:last-child {
        margin: 0;
      }
      &:hover,
      &_active {
        border: 3px solid #fecc0d;
      }

      img {
        max-width: none;
      }
    }
    &__current {
      display: inline-block;
      border: 3px solid transparent;
      line-height: 0;
      &:hover>.type-window__items {
        display: flex;
      }
      &:hover,
      &_active {
        border: 3px solid #fecc0d;
      }
    }
    &__mosquito {
      width: 75px;
      text-align: center;
      position: absolute;
      bottom: 40%;
      left: 25%;
      margin-left: -40px;
      z-index: 2;
    }
    @media screen and (max-width: $breakpoint-tablet) {
      width: 100%;
      text-align: center;
      &__group {
        display: inline-block;
        margin-right: 20px;
      }
      &__items {
        flex-direction: column;
      }
      &__item {
        margin: 0 0 20px 0;
        &:last-child {
          margin: 0;
        }
      }
    }
  }
  
  .number-field {
    display: inline-block;
    border-radius: .25rem;
    border: 1px solid #ddd;
    font-size: 16px;
    transition: border-color .15s;
    padding: 5px 0px;
    text-align: center;
    font-size: 30px;
    width: 80px;
    box-sizing: border-box;
    &:focus {
      border-color: #0074d9;
      outline: none;
    }
  }
  
  .params {
    flex-basis: 100%;
    display: flex;
    justify-content: center;
    margin-top: 35px;
    &__label {
      display: block;
      text-align: center;
      font-size: 14px;
    }
    &__separator {
      font-size: 22px;
      padding: 5px 10px;
      margin-left: -25px;
      padding-top: 9px;
    }
    &__col {
      margin-right: 25px;
      flex-shrink: 0;
    }
    &__row {
      margin-bottom: 10px;
    }
    &__group {
      display: flex;
    }
    @media (max-width: $breakpoint-tablet) {
      justify-content: center;
      flex-wrap: wrap;
    }
  }
  
  div.ranger {
    &_vertical {
      position: absolute;
      margin-left: 25px;
    }
    &_horizontal {
      margin: 20px auto 0px;
    }
    @media (max-width: $breakpoint-mobile) {
      display: none;
    }
  }
  
  .window {
    text-align: center;
    max-width: 480px;
    width: 100%;
    
    &__mouse {
      line-height: 22px;
      font-size: 15px;

      img {
        vertical-align: sub;
      }
    }
    @media (max-width: $breakpoint-tablet) {
      margin: 0 auto;
      max-width: 100%;
    }
  }
  
  .window__preview {
    position: relative;
    display: inline-block;
    max-height: 366px;
    max-width: 63%;
    min-height: 310px;
    img {
      display: inline-block;
      max-width: 100%;
      height: auto;
    }
    @media (max-width: $breakpoint-mobile) {
      padding-left: 0px;
      min-height: 0;
      max-width: 100%;
    }
  }
  
  .preview-layer {
    position: absolute;
    top: 0;
    left: 0;
  }
  
  .button {
    border: none;
    background: #3498db;
    padding: 10px 20px;
    color: white;
    font-weight: bold;
    height: 46px;
    cursor: pointer;
    span {
      display: inline-block;
      vertical-align: middle;
      margin-left: 10px;
    }
    svg {
      fill: $text-color;
      width: 26px;
      height: 26px;
      display: inline-block;
      vertical-align: middle;
    }
  }
  
  .price-block {
    background: white;
    padding: 5px 10px 15px;
    border: 3px solid #eee;
    border-radius: 3px;
    position: relative;
    &__title {
      margin: 7px 0;
    }
    &__value {
      &_old {
        text-decoration: line-through;
      }
    }
    &__buttons {
      text-align: center;
      flex-grow: 1;
    }
    &__controls {
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
      @media (max-width: $breakpoint-mobile) {
        justify-content: center;
      }
    }
    &__info {
      text-align: center;
      font-size: 18px;
      font-weight: bold;
      margin: 20px 10px;
    }
    &__head {
      padding: 0 10px 10px;
      border-bottom: 1px solid #eeeeee;
    }
    &__unit {
      display: inline-block;
      vertical-align: middle;
      margin-left: 10px;
    }
    &__qt {
      flex-grow: 1;
      text-align: center;
      margin-bottom: 10px;

      .number-input {
        vertical-align: middle;
      }
      @media (max-width: $breakpoint-mobile) {
        margin-bottom: 10px;
      }
    }
    &__add {
      font-size: 18px;
      font-weight: normal;
      text-transform: uppercase;
    }
    @media (max-width: $breakpoint-mobile) {
      text-align: center;
    }
  }
  
  .price-result {
    display: flex;
    margin-top: 5px;
    flex-wrap: wrap;
    &__total {
      font-size: 30px;
      font-weight: 800;
      color: $price-color;
    }
    &__components {
      margin-left: 10px;
      p {
        margin: 0px;
        color: gray;
      }
    }
    @media (max-width: $breakpoint-mobile) {
      justify-content: center;
    }
  }
  
  .discount {
    background: url(#{$assetPath}/flag-discount.png) no-repeat;
    position: absolute;
    top: 0;
    right: 4px;
    width: 122px;
    height: 154px;
    text-align: center;
    &__unit {
      font-size: 35px;
      margin: 16px 0px 0px 0px;
    }
    &__value {
      margin: 27px 0 0;
      display: inline-block;
      vertical-align: top;
      font-size: 52px;
      color: #ffd800;
      letter-spacing: -6px;
    }
    &__unit {
      margin-top: 44px;
      font-size: 35px;
    }
    &__text {
      display: block;
      font-size: 21px;
      color: #fff;
      text-transform: uppercase;
      font-weight: 700;
      margin-top: -7px;
    }
    @media (max-width: $breakpoint-tablet) {
      display: none;
    }
  }
  
  .calculations {
    background: #eceaea;
    padding: 5px 10px 15px;
    border: 3px solid #e4e4e4;
    border-radius: 3px;
    position: relative;
    margin-top: 20px;
    
    &__preview {
      text-align: center;
      position: relative;
      display: inline-block;
    }
    &__image {
      width: 80px;
      text-align: center;
    }
    &__title {
      text-transform: uppercase;
      text-align: center;
      margin: 10px 0px;
    }
    &__list {
      border-top: 1px solid #c5c5c5;

      > p {
        margin: 0px;
      }
    }
    &__image {
      img {
        max-height: 70px;
      }
    }
    &__item {
      display: flex;
      align-items: stretch;
      border-bottom: 1px solid #c5c5c5;
      padding: 5px 0px;
    }
    &__params {
      flex-grow: 2;
      padding: 0px 10px;
      p {
        margin: 0px;
        font-size: 14px;
      }
    }
    &__delete {
      font-size: 0px;
      background: url(#{$assetPath}/delete-button.svg) no-repeat;
      width: 30px;
      height: 30px;
      display: inline-block;
      background-size: contain;
      opacity: 0.6;
      transition: opacity 0.7s ease;
      &:hover {
        opacity: 1;
      }
    }
    &__results {
      display: flex;
      align-items: baseline;
      justify-content: flex-end;
      margin-top: 6px;
    }
    &__total-label {
      font-weight: bold;
      font-size: 20px;
      margin-right: 10px;
    }
    &__submit {
      border-top: 1px solid #c5c5c5;
      margin-top: 13px;
      text-align: center;
    }
    &__want {
      color: red;
    }
    &__recall {
      margin: 5px 0px 0px;
    }
    &__button {
      display: flex;
      align-items: center;
    }
    &__qt {
      line-height: 74px;

    }
  }
  
  [type=checkbox] {
    display: none;
    +label {
      display: inline-block;
      vertical-align: middle;
      margin-top: -5px;
      &:hover:before {
        border-color: $primary-color;
        color: $primary-color;
      }
      &:before {
        content: "";
        width: 17px;
        height: 17px;
        border: 1px solid #ddd;
        background: white;
        display: inline-block;
        vertical-align: bottom;
        margin-right: 5px;
        transition: border-color .15s;
        border-radius: .25rem;
        text-align: center;
        line-height: 18px;
      }
    }
    &:checked+label {
      &:before {
        content: '✔';
      }
    }
  }
  
  select {
    display: block;
    appearance: none;
    padding: 10px 7px;
    width: 100px;
    border-radius: .25rem;
    border: 1px solid #ddd;
    font-size: 16px;
    max-width: 100%;
    transition: border-color .15s;
    background: white url(#{$assetPath}/arrow-down-sign-to-navigate.svg) 94% center no-repeat;
    background-size: 20%;
    &:focus {
      border-color: #0074d9;
      outline: none;
    }
  }
  .color-picker {
    display: inline-block;
    vertical-align: middle;
    margin-left: -6px;
  }
  /* Animations */
  .fade-enter-active, .fade-leave-active {
    transition: opacity .5s;
  }
  .fade-enter, .fade-leave-to /* .fade-leave-active до версии 2.1.8 */ {
    opacity: 0;
  }

  .list-item {
    display: inline-block;
    margin-right: 10px;
  }
  .list-enter-active, .list-leave-active {
    transition: all 0.5s;
  }
  .list-enter, .list-leave-to /* .list-leave-active до версии 2.1.8 */ {
    opacity: 0;
    transform: translateY(30px);
  }
  /* Overrides component's styles */
  /deep/ .vue-slider-component .vue-slider-tooltip {
    background: white;
    color: #2b2b2b;
    font-size: 20px;
  }
  /deep/ .vue-slider-component.vue-slider-vertical .vue-slider-piecewise {
    background: url(#{$assetPath}/ruler-y.png) repeat-y;
  }
  /deep/ .vue-slider-component.vue-slider-horizontal .vue-slider-piecewise {
    background: url(#{$assetPath}/ruler-x.png) repeat-x 0px bottom;
  }
  /deep/ .vue-slider-component .vue-slider {
    background: #ffedb9;
    border-radius: 0px;
  }
  /deep/ .vue-slider-component .vue-slider-process {
    background: #00000017;
    border-radius: 0px;
  }
  /deep/ input.number-input__input {
    width: 30px;
  }
  /deep/ .number-input--controls input.number-input__input {
    padding: 10px 45px;
    box-sizing: border-box;
    width: 120px;
  }
</style>
