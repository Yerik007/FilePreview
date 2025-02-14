<!--
 * @Author: C.
 * @Date: 2022-08-19 17:00:14
-->
<template>
    <div class="img-box">
        <el-image :src="images" :preview-src-list="[images]" fit="scale-down"></el-image>
    </div>
</template>

<script>
export default {
    name: "ImageViewer",
    props: {
        image: String
    },
    data() {
        return {
            showViewer: false
        };
    },
    computed: {
        images() {
            // console.log(this.image);
            return this.image;
        }
    }
};
</script>

<style scoped>
.img-box {
/*    !* padding: 10px; *!*/
/*    position: absolute;*/
/*    width: calc(100% - 40px);*/
/*    height: calc(100% - 60px);*/
/*    overflow: auto;*/
/*    overflow: hidden;*/
/*    !* min-height: 500px; *!*/
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>
