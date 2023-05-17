<template>
  <el-form ref="formRef" :model="form" label-width="80px">
    <el-form-item prop="email" :rules="emailRule" label="Email:">
      <el-input v-model="form.email" ></el-input>
    </el-form-item>
    <el-form-item required prop="fileList" label="File:">
      <el-upload
        class="upload-demo"
        drag
        :auto-upload="false"
        v-model:file-list="form.fileList"
        accept=".pdf"
        action="https://run.mocky.io/v3/9d059bf9-4660-45f2-925d-ce80ad6c4d15"
        :on-change="(uploadFile) => { handleChange(uploadFile, formRef) }"
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          Drop file here or <em>click to upload</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            pdf file with a size less than 10MB
          </div>
        </template>
      </el-upload>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="onSubmit(formRef)">Submit</el-button>
      <el-button @click="resetForm(formRef)">Reset</el-button>
      <el-button @click="getTestFile">Get Test File</el-button>
    </el-form-item>
  </el-form>
  <pre :textContent="xmlText"></pre>
</template>
<script setup lang="ts">
import HelloWorld from './components/HelloWorld.vue'
import type { UploadProps, UploadUserFile, FormInstance } from 'element-plus'
import { ref, reactive, toRaw } from 'vue'
import * as pdfjsLib from 'pdfjs-dist'


const formRef = ref<FormInstance>()
const form = ref({
  email: '',
  fileList: []
})
const xmlText = ref('')
const resetForm = (formEl: FormInstance | undefined) => {
  formEl.resetFields()
}
const onSubmit = async (formEl: FormInstance | undefined) => {
  // await formEl.validate()
  const formData = new FormData()
  formData.append('email', form.value.email)
  formData.append('file', form.value.fileList[0].raw)
  // fetch('/submit', {
  //   method: 'post',
  //   body: formData
  // })
}

const emailRule = [
  {
    required: true,
    message: 'Please input email address',
    trigger: 'blur',
  },
  {
    type: 'email',
    message: 'Please input correct email address',
    trigger: ['blur', 'change'],
  },
]

const getTestFile = () => {
  const url = new URL('./test.pdf', import.meta.url).href;
  const link = document.createElement('a');
  link.href = url;
  link.download = 'test.pdf';
  // 在部分浏览器中，需要将link元素添加到文档中才能生效
  document.body.appendChild(link);
  // 模拟点击下载链接
  link.click();
  // 移除临时元素
  document.body.removeChild(link);
}

const handleChange = async (uploadFile, formEl: FormInstance | undefined) => {
  const blob = new Blob([uploadFile.raw])
  const url = URL.createObjectURL(blob)
  
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('./../public/pdf.worker.js', import.meta.url).href;
  var loadingTask = pdfjsLib.getDocument(url)
  loadingTask.promise.then(async function(pdf) {
    const pageCount = pdf.numPages;

    // 逐页读取PDF文件的内容
    let allItems = []
    for (let pageNumber = 1; pageNumber <= pageCount; pageNumber++) {
      const page = await pdf.getPage(pageNumber);
      // 获取文本内容
      const textContent = await page.getTextContent();
      // 提取每个文本块的文本内容
      const textItems = textContent.items;
      const items = textItems.filter(i => i.str.includes(':'))
      allItems.push(...items)
    }
    const xmlDocument = document.implementation.createDocument(null, 'root');
    allItems.forEach(item => {
      let [key, value] = item.str.split(':')
      const newElement = xmlDocument.createElement(key.trim());
      const textNode = xmlDocument.createTextNode(value.trim());
      newElement.appendChild(textNode);
      xmlDocument.documentElement.appendChild(newElement);
    })
    xmlText.value = new XMLSerializer().serializeToString(xmlDocument);
    console.log(xmlDocument);
  }).catch(console.log)
  formEl.validate()
}
</script>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
