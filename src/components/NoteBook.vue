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
              <a href="#" class="card-footer-item" v-on:click="editNote(note)">Edit</a>
              <a href="#" class="card-footer-item" v-on:click="deleteNote(note)">Delete</a>
            </footer>
          </div>
          <br>
        </div>
      </div>

      <div class="column">
        <div>
          <input v-model="note_title" class="input" type="text" placeholder="Title">
        </div>
        <br />
        <div>
          <textarea v-model="note_text" class="textarea" placeholder="...write your notes"></textarea>
        </div>
        <br />
        <div>
          <a class="button is-link" v-if="editingNote === false" v-on:click="addNote()">Add Note</a>
          <a class="button is-link" v-if="editingNote === true" v-on:click="saveNote()">Save Changes</a>
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

export default {
  name: 'notebook',
  data () {
    return {
      notebook: notebookStorage.fetch(),
      note_title: null,
      note_text: null,
      editedNote: null,
      editingNote: false
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
      this.notebook.push({ 'title': this.note_title, 'text': this.note_text })
      this.clearScreen()
    },
    deleteNote: function (note) {
      this.notebook.splice(this.notebook.indexOf(note), 1)
    },
    editNote: function (note) {
      this.editedNote = note
      this.editingNote = true
      this.note_title = note.title
      this.note_text = note.text
    },
    saveNote: function () {
      var index = this.notebook.indexOf(this.editedNote)
      this.notebook[index].title = this.note_title
      this.notebook[index].text = this.note_text
      this.clearScreen()
      this.editedNote = null
      this.editingNote = false
    },
    clearScreen: function () {
      this.note_title = ''
      this.note_text = ''
    }
  }
}
</script>

<style lang="scss">

.card-header-title{
  background-color: white;
  padding: 4px;
}

</style>
