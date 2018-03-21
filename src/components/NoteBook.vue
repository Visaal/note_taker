<template>
  <div id="newnote">
    <div class="columns">

      <div class="column is-3">

        <nav class="panel">
          <p class="panel-heading">
            <code class="subtitle is-5">Notes</code>
          </p>

          <div class="panel-block">
            <code class="subtitle is-6">Search Notes</code><br>
            <p class="control has-icons-left">
              <input class="input is-small" placeholder="search notes" v-model="searchText">
              <span class="icon is-small is-left">
                <i class="fa fa-search"></i>
              </span>
            </p>
          </div>

          <div class="panel-block tags">
            <code class="subtitle is-6">Filter By Tag</code><br>
            <a v-for="tag in allTags" :key="tag.id" class="tag is-info" v-on:click="searchTag = tag">{{ tag }}</a>
          </div>

          <div v-if='searchTag || searchText' class="panel-block">
            <code class="subtitle is-6">Your Filters</code>
            <div class="field is-grouped is-grouped-multiline">
              <div v-if=searchTag class="control">
                <div class="tags has-addons">
                  <span class="tag is-info">{{ searchTag }}</span>
                  <a class="tag is-delete is-warning" v-on:click="searchTag = ''"></a>
                </div>
              </div>

              <div v-if=searchText class="control">
                <div class="tags has-addons">
                  <span class="tag is-primary">{{ searchText }}</span>
                  <a class="tag is-delete is-warning" v-on:click="searchText = ''"></a>
                </div>
              </div>
            </div>
          </div>

          <a class="panel-block" id="notebook" v-for="note in filteredNotes" :key="note.id">
            <span>
              <code class="subtitle is-6">{{ note.title }}</code>
              <span class="pull-right">
                <a href="#" v-on:click="viewNote(note)">View</a>
                <a href="#" v-on:click="editNote(note)">Edit</a>
                <a href="#" v-on:click="deleteNote(note)">Delete</a>
                <a href="#" v-on:click="downloadMarkDown(note)">DL</a>
              </span>
            </span>
            <p class="is-size-7">{{ note.text }}</p>
          </a>
        </nav>

      </div>

      <div class="column">

        <div class="columns">
          <div class="column">
            <input v-if="mode != 'view'" v-model="tag_name" type="text" class="input" v-on:keyup.enter="addTag()" placeholder="add tags">
          </div>
          <div class="column is-1">
            <a v-bind:class="{ 'icon has-text-warning': starred, 'icon has-text-grey-lighter': !starred }">
              <i class="fa fa-star fa-2x" aria-hidden="true" v-on:click="toggleStarred()"></i>
            </a>
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
import saveAs from 'file-saver'

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
      tag_name: '',
      starred: false,
      allTags: [],
      searchTag: '',
      searchText: ''
    }
  },
  // watch notebook changes for localStorage persistence and tag updates
  watch: {
    notebook: {
      handler: function (notebook) {
        notebookStorage.save(notebook)
        this.getDistinctTagList()
      },
      deep: true
    }
  },
  created: function () {
    this.getDistinctTagList()
  },
  methods: {
    addNote: function () {
      this.note_title = this.generateNoteTitle()
      this.notebook.push({ 'title': this.note_title, 'text': this.note_text, 'tags': this.tag_array, 'starred': this.starred })
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
      this.notebook[index].title = this.generateNoteTitle()
      this.notebook[index].text = this.note_text
      this.notebook[index].starred = this.starred
      this.clearScreen()
      this.selectedNote = null
      this.mode = ''
    },
    selectNote: function (note) {
      this.selectedNote = note
      this.note_title = note.title
      this.note_text = note.text
      this.tag_array = note.tags
      this.starred = note.starred
      this.tag_name = ''
    },
    clearScreen: function () {
      this.note_title = ''
      this.note_text = ''
      this.tag_array = []
      this.tag_name = ''
      this.starred = false
      this.mode = 'new'
    },
    downloadMarkDown: function (note) {
      var blob = new Blob([note.text], {type: 'text/markdown'})
      var filename = note.title + '.md'
      saveAs(blob, filename)
    },
    marked: function () {
      return marked(this.note_text)
    },
    togglePreview: function () {
      this.showPreview = !this.showPreview
    },
    addTag: function () {
      this.tag_array.push(this.tag_name)
      this.tag_name = ''
    },
    removeTag: function (tag) {
      this.tag_array.splice(this.tag_array.indexOf(tag), 1)
    },
    toggleStarred: function () {
      this.starred = !this.starred
    },
    getDistinctTagList: function () {
      // Merge all tag arrays into single one
      var allTagArray = []
      this.notebook.forEach(function (note) {
        allTagArray.push(...note.tags)
      })
      // Create distinct array
      this.allTags = [...new Set(allTagArray)]
    },
    filterNoteText: function () {
      return this.notebook.filter(note => {
        return (note.title.toLowerCase().indexOf(this.searchText.toLowerCase()) > -1 || (note.text.toLowerCase().indexOf(this.searchText.toLowerCase()) > -1))
      })
    },
    filterNoteTags: function () {
      if (this.searchTag === '') {
        return this.notebook
      } else {
        return this.notebook.filter(note => {
          return note.tags.indexOf(this.searchTag) > -1
        })
      }
    },
    removeInititalCharacters: function (inputString, character) {
      while (inputString[0] === character) {
        inputString = inputString.substring(1)
      }
      return inputString
    },
    generateNoteTitle: function () {
      this.note_title = this.note_text.split('\n')[0] // take title from text body
      this.note_title = this.note_title.substring(0, 200)
      this.note_title = this.note_title.replace(/[\\/:"*?<>|]/g, '') // regex to generate a valid file name
      this.note_title = this.removeInititalCharacters(this.note_title, '#') // deal with markdown titles
      this.note_title = this.note_title.trim()
      return this.note_title
    }
  },
  computed: {
    filteredNotes () {
      return this.filterNoteText().filter(note => {
        return this.filterNoteTags().indexOf(note) > -1
      })
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
.tags:not(:last-child) {
  margin-bottom: 0px;
}

// styling for panel block to allow normal formatting html tags within them
.panel-block {
  display: block;
}

</style>
