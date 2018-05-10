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
        if (this.currentItem['slug_parent']) {
            return this.currentItem['slug_parent'];
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