<template>
  <div id="newnote">
    <div class="columns">

      <div class="column is-3">
        <div id="notebook" v-for="note in notebook" :key="note.id">
          <div class="card">
            <header class="card-header">
              <p class="card-header-title">
                {{ note.title }}
              </p>
            </header>
            <div class="card-content">
              <div class="content">
                {{ note.text }}
              </div>
            </div>
            <footer class="card-footer">
              <a href="#" class="card-footer-item" v-on:click="viewNote(note)">View</a>
              <a href="#" class="card-footer-item" v-on:click="editNote(note)">Edit</a>
              <a href="#" class="card-footer-item" v-on:click="deleteNote(note)">Delete</a>
            </footer>
          </div>
          <br>
        </div>
      </div>

      <div class="column">

        <div class="columns">
          <div class="column is-9">
            <input v-model="note_title" class="input" type="text" placeholder="title">
          </div>
          <div class="column">
            <input v-if="mode != 'view'" v-model="tag_name" type="text" class="input" v-on:keyup.enter="addTag()" placeholder="add tags">
          </div>
        </div>

        <div class="tags">
          <span v-for="tag in tag_array" :key="tag.id" class="tag is-info">{{ tag }} &nbsp; <button v-if="mode != 'view'" class="delete is-small" v-on:click="removeTag(tag)"></button></span>
        </div>

        <div class="columns">
          <div class="column" v-if="mode != 'view'">
            <div>
              <textarea v-model="note_text" class="textarea is-small" v-bind:class="{rows: textAreaHeight }" placeholder="...write your notes"></textarea>
            </div>
          </div>
          <div class="column" v-if="showPreview === true">
            <div>
              <div class="content preview" v-html="marked()"></div>
            </div>
          </div>
        </div>

        <div>
          <a class="button is-link" v-if="mode === 'new'" v-on:click="addNote()">Add Note</a>
          <a class="button is-link" v-if="mode === 'edit'" v-on:click="saveNote()">Save Changes</a>
          <a class="button is-link" v-if="mode != 'view'" v-on:click="togglePreview()">
            <span v-if="showPreview">Hide Preview</span>
            <span v-else>Show Preview</span>
          </a>
          <a class="button is-link" v-if="mode === 'view'" v-on:click="clearScreen()">Close</a>
        </div>

      </div>

    </div>
  </div>
</template>

<script>

// localStorage persistence
var STORAGE_KEY = 'notes'
var notebookStorage = {
  fetch: function () {
    var notebook = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    notebook.forEach(function (note, index) {
      note.id = index
    })
    notebookStorage.uid = notebook.length
    return notebook
  },
  save: function (notebook) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notebook))
  }
}

let marked = require('marked')

export default {
  name: 'notebook',
  data () {
    return {
      notebook: notebookStorage.fetch(),
      note_title: null,
      note_text: '',
      selectedNote: null,
      textAreaHeight: 20,
      showPreview: true,
      mode: 'new', // edit, read, new
      tag_array: [],
      tag_name: ''
    }
  },
  // watch notebook changes for localStorage persistence
  watch: {
    notebook: {
      handler: function (notebook) {
        notebookStorage.save(notebook)
      },
      deep: true
    }
  },
  methods: {
    addNote: function () {
      this.notebook.push({ 'title': this.note_title, 'text': this.note_text, 'tags': this.tag_array })
      this.clearScreen()
    },
    deleteNote: function (note) {
      this.notebook.splice(this.notebook.indexOf(note), 1)
    },
    editNote: function (note) {
      this.mode = 'edit'
      this.selectNote(note)
    },
    viewNote: function (note) {
      this.mode = 'view'
      this.selectNote(note)
    },
    saveNote: function () {
      var index = this.notebook.indexOf(this.selectedNote)
      this.notebook[index].title = this.note_title
      this.notebook[index].text = this.note_text
      this.clearScreen()
      this.selectedNote = null
      this.mode = ''
    },
    selectNote: function (note) {
      this.selectedNote = note
      this.note_title = note.title
      this.note_text = note.text
      this.tag_array = note.tags
      this.tag_name = ''
    },
    clearScreen: function () {
      this.note_title = ''
      this.note_text = ''
      this.tag_array = []
      this.tag_name = ''
      this.mode = 'new'
    },
    marked: function () {
      return marked(this.note_text)
    },
    togglePreview: function () {
      this.showPreview = !this.showPreview
    },
    addTag: function () {
      console.log(this.tag_name)
      console.log(this.tag_array)
      this.tag_array.push(this.tag_name)
      this.tag_name = ''
    },
    removeTag: function (tag) {
      this.tag_array.splice(this.tag_array.indexOf(tag), 1)
    }
  }
}
</script>

<style lang="scss">

.card-header-title{
  background-color: white;
  padding: 4px;
}

.preview {
  padding: 3%;
  background-color: hsl(0, 0%, 92%);
  font-size: 75%;
  // line-height: 100%
}

// tag styling
.tag_list {
  padding-left: 2px;
}

</style>
