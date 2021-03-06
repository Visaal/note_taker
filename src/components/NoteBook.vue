<template>
  <div id="newnote">
    <div class="columns">

      <!-- NOTES PANEL -->
      <div class="column is-3">
        <nav class="panel">
          <p class="panel-heading is-clearfix">
            <code class="subtitle is-5">Notes</code>
              <span class="pull-right">
                <a href="#" v-on:click="clearScreen()"><i class="fa fa-plus-circle has-text-success is-size-3"></i></a>
              </span>
          </p>
          <!-- SEARCH NOTES -->
          <div class="panel-block">
            <code class="subtitle is-6">Search Notes</code><br>
            <p class="control has-icons-left">
              <input class="input is-small" placeholder="search notes" v-model="searchText">
              <span class="icon is-small is-left">
                <i class="fa fa-search"></i>
              </span>
            </p>
          </div>
          <!-- FILTER NOTES BY TAG -->
          <div class="panel-block tags">
            <code class="subtitle is-6">Filter By Tag</code><br>
            <a v-for="tag in allTags" :key="tag.id" class="tag is-info" v-on:click="searchTag = tag">{{ tag }}</a>
          </div>
          <!-- ACTIVE FILTERS -->
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

          <span class="panel-block" id="notebook" v-for="note in filteredNotes" :key="note.id">
            <span>
              <a v-on:click="viewNote(note)"><code class="subtitle is-6">{{ note.title }}</code></a>
              <span class="pull-right">
                <a href="#" v-on:click="editNote(note)"><i class="fa fa-lg fa-pencil has-text-grey" aria-hidden="true"></i></a>
                <a href="#" v-on:click="confirmNoteDeletion(note)"><i class="fa fa-lg fa-trash has-text-grey modal-button" data-target="modal" aria-haspopup="true" aria-hidden="true"></i></a>
                <a href="#" v-on:click="downloadMarkDown(note)"><i class="fa fa-lg fa-arrow-circle-down has-text-grey" aria-hidden="true"></i></a>
              </span>
            </span>
            <a v-on:click="viewNote(note)"><p class="is-size-7 has-text-grey">{{ note.text }}</p></a>
            <p class="is-size-7 has-text-grey-light">{{ note.last_modified_string }}</p>
          </span>
        </nav>
      </div>

      <!-- MAIN NOTE AREA -->
      <div class="column">
        <nav class="level">
          <div class="level-left">
            <div>
              <code class="subtitle is-5"><span v-if="note_title">{{ note_title }}</span><span v-else>New Note</span></code>
            </div>
          </div>

          <!-- TAGS AND STAR NOTE -->
          <div class="level-right">
            <div class="level-item">
              <!-- DISPLAY TAGS -->
              <div class="tags">
                <span v-for="tag in tag_array" :key="tag.id" class="tag is-info">{{ tag }} &nbsp; <button v-if="mode != 'view'" class="delete is-small" v-on:click="removeTag(tag)"></button></span>
              </div>
            </div>
            <!-- ADD TAGS -->
            <div class="level-item">
              <div v-if="mode != 'view'" class="field has-addons">
                <div class="control">
                  <input v-model="tag_name" type="text" class="input is-small is-rounded" v-on:keyup.enter="addTag()" placeholder="add tags">
                </div>
                <div class="control">
                  <a class="button is-small is-rounded is-info" v-on:click="addTag()">
                    Add
                  </a>
                </div>
              </div>
            </div>
            <!-- STAR NOTE -->
            <div class="level-item">
              <span v-bind:class="{ 'icon has-text-warning': starred, 'icon has-text-grey-lighter': !starred }">
                <i class="fa fa-star fa-2x" aria-hidden="true" v-on:click="toggleStarred()"></i>
              </span>
            </div>
            <!-- PREVIEW PANE TOGGLE -->
            <div v-if="mode != 'view'" class="level-item">
              <span class="tooltip is-tooltip-left" data-tooltip="Toggle Preview" v-bind:class="{ 'icon has-text-info': showPreview, 'icon has-text-grey-lighter': !showPreview }">
                <i class="fa fa-columns fa-2x" aria-hidden="true" v-on:click="togglePreview()"></i>
              </span>
            </div>
          </div>
        </nav>

        <div class="tile is-ancestor">
          <!-- TEXT EDITOR -->
          <div class="tile is-vertical" v-if="mode != 'view'">
            <div class="tile is-parent us">
              <textarea v-model="note_text" class="is-small editor-content" contenteditable="true" placeholder="...write your notes"></textarea>
            </div>
          </div>
          <!-- PREVIEW PANE -->
          <div class="tile is-parent" v-if="showPreview === true">
            <article class="tile is-child box">
              <div class="content preview" v-html="marked()"></div>
            </article>
          </div>
        </div>

      </div>

    </div>

    <!-- CONFIRM DELETE MODAL WINDOW -->
    <div class="modal" v-bind:class="{ 'is-active': deletingNote }">
      <div class="modal-background"></div>
      <div class="modal-content">
        <div class="tile is-parent">
          <article class="tile is-child notification is-info">
            <p>Are you sure you would like to delete <strong>{{ note_title }}</strong>?</p>
            <br>
            <div class="content is-pulled-right">
              <p class="buttons">
                <a class="button is-danger is-focused" v-on:click='deleteNote()'>
                  <span class="icon">
                    <i class="fa fa-trash"></i>
                  </span>
                  <span>Delete</span>
                </a>
                <a class="button is-success" v-on:click='deletingNote =! deletingNote'>
                  <span class="icon">
                    <i class="fa fa-minus-circle"></i>
                  </span>
                  <span>Cancel</span>
                </a>
              </p>
            </div>
          </article>
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
      showPreview: true,
      mode: 'new', // edit, read, new
      tag_array: [],
      tag_name: '',
      starred: false,
      allTags: [],
      searchTag: '',
      searchText: '',
      selectedNoteCompoundProperty: null,
      deletingNote: false
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
    },
    // watch compound property to automatically save note
    compoundProperty: {
      handler: function () {
        this.autosaveNote()
      }
    }
  },
  created: function () {
    this.getDistinctTagList()
    // Show the latest note that was worked on when opening the app
    this.viewNote(this.notebook[0])
  },
  methods: {
    autosaveNote: function () {
      // check whether an existing note or a new note
      if (this.selectedNote) {
        // check if the note has changed and save if it has
        if (this.selectedNoteCompoundProperty !== this.compoundProperty) {
          this.saveNote()
        }
      // if new note add it once some text has been written and select it
      } else {
        if (this.note_text) {
          this.selectedNote = this.addNote()
        }
      }
    },
    addNote: function () {
      this.note_title = this.generateNoteTitle()
      let note = {
        'title': this.note_title,
        'text': this.note_text,
        'tags': this.tag_array,
        'starred': this.starred,
        'last_modified_timestamp': Date.now(),
        'last_modified_string': this.formatDateTime(Date.now())
      }
      this.notebook.push(note)
      this.sortNotesByLastModified()
      return note
    },
    confirmNoteDeletion: function (note) {
      this.deletingNote = true
      this.selectNote(note)
    },
    deleteNote: function () {
      this.notebook.splice(this.notebook.indexOf(this.selectedNote), 1)
      this.deletingNote = false
      this.viewNote(this.notebook[0])
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
      this.notebook[index].last_modified_timestamp = Date.now()
      this.notebook[index].last_modified_string = this.formatDateTime(Date.now())
      this.sortNotesByLastModified()
    },
    selectNote: function (note) {
      this.selectedNote = note
      this.note_title = note.title
      this.note_text = note.text
      this.tag_array = note.tags
      this.starred = note.starred
      this.tag_name = ''
      this.selectedNoteCompoundProperty = [this.note_text, this.tag_array, this.starred].join()
    },
    sortNotesByLastModified: function () {
      this.notebook.sort(function (a, b) {
        return b.last_modified_timestamp - a.last_modified_timestamp
      })
    },
    clearScreen: function () {
      this.selectedNote = null
      this.note_title = ''
      this.note_text = ''
      this.tag_array = []
      this.tag_name = ''
      this.starred = false
      this.selectedNoteCompoundProperty = null
      this.mode = 'new'
      this.deletingNote = false
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
    },
    formatDateTime: function (dateObject) {
      let options = { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }
      let dateTime = new Date(dateObject)
      return dateTime.toLocaleString('en-GB', options).replace(',', '')
    }
  },
  computed: {
    filteredNotes () {
      return this.filterNoteText().filter(note => {
        return this.filterNoteTags().indexOf(note) > -1
      })
    },
    compoundProperty () {
      // track the values to watch for a change
      // `.join()` because we don't care about the return value.
      return [this.note_text, this.tag_array, this.starred].join()
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
  font-size: 75%;
}

// tag styling
.tags:not(:last-child) {
  margin-bottom: 0px;
}

// styling for panel block to allow normal formatting html tags within them
.panel-block {
  display: block;
  // truncate long text within a p tag in note cards
  p {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

// specific styling to make editor-content textarea take up more of the screen as textarea has a height limit
.tile .is-parent textarea {
  -webkit-appearance: none;
  -webkit-box-align: center;
  -webkit-box-direction: normal;
  align-items: center;
  border: 1px solid transparent;
  padding: 0.625em;
  resize: vertical;
  height: 80vh;
  line-height: 1.5;
  justify-content: flex-start;
  vertical-align: top;
  background-color: white;
  border-color: #dbdbdb;
  color: #363636;
  box-shadow: inset 0 1px 2px rgba(10, 10, 10, 0.1);
  width: 100%;
}

</style>
