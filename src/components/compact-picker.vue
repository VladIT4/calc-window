<template>
  
  <div class="color-picker">
    <div class="color-picker__current" :style="'background-color: '+ selected_color" @click.prevent="selecting = true"></div>
    <div class="color-picker__list" v-show="selecting">
      <div :class="{ 'color-picker__item': true, 
           'color-picker__item_active': color.toLowerCase() == selected_color.toLowerCase(),
           'color-picker__item_light': isLight(color) }" 
           v-for="(color, ind) in colors" 
           :key="ind" 
           :title="ind" 
           :style="'background-color: '+color"
           @click.prevent="changeColor(color, ind)"
           >
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
var tinycolor = require("tinycolor2");
 

@Component
export default class CompactPicker extends Vue {
  @Prop() private colors!:any;
  @Prop() private default_color!:any;
  private selecting:boolean = false;
  selected_color:string = '';
  selected_color_title:string = '';

  changeColor(color:string, title:string) {
    this.selected_color = color.toLowerCase();
    this.selected_color_title = title;
    this.selecting = false;
    this.$emit('change', this.selected_color, this.selected_color_title);
  }
  isLight(color:string) {
    return tinycolor(color).isLight();
  }
   
  created() {
    if('color' in this.default_color) {
      this.selected_color = this.default_color.color;
      this.selected_color_title = this.default_color.title;
    }

    let self = this;
    // @ts-ignore: Unreachable code error
    document.body.addEventListener('click', function(event) {
      // @ts-ignore: Unreachable code error
      if(!(event.target == self.$el || self.$el.contains(event.target))) {
        self.selecting = false;
      }
    });
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.color-picker {
  &__current {
    width: 22px;
    height: 22px;
    border: 2px solid silver;
    display: inline-block;
    margin: 3px;
    border-radius: 3px;
    cursor: pointer;
  }
  &__list {
    display: flex;
    flex-wrap: wrap;
    width: 160px;
    background: white;
    border: 1px solid #ccc;
    border-radius: 0 3px 3px 3px;
    padding: 10px;
    position: absolute;
  }
  &__item {
    @extend .color-picker__current;

    &_active {
      border-color: orange;
      color: white;
      &:before {
        content: '•';
        text-align: center;
        width: 100%;
        height: 100%;
        display: block;
        
      }
    }
    &_light {
      color: black;
    }
  }
}
</style>
