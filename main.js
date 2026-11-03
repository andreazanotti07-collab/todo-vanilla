import "./style.css";

const CHIAVE = "todo-tasks";

// Carica le attività salvate nel browser.
function caricaStato() {
  const testo = localStorage.getItem(CHIAVE);

  if (testo === null) {
    return [];
  }

  try {
    const dati = JSON.parse(testo);

    // Controlla che i dati salvati siano un array.
    if (Array.isArray(dati)) {
      return dati;
    }

    return [];
  } catch (errore) {
    console.error("Errore nel caricamento delle attività:", errore);
    return [];
  }
}

let tasks = caricaStato();

// Recupera gli elementi HTML.
const lista = document.querySelector("#lista");
const info = document.querySelector("#info");
const form = document.querySelector("#form-task");
const campo = document.querySelector("#campo-task");

// Salva le attività nel localStorage.
function salvaStato() {
  localStorage.setItem(CHIAVE, JSON.stringify(tasks));
}

// Aggiorna lo stato, salva i dati e ridisegna la lista.
function aggiornaStato(nuoviTasks) {
  tasks = nuoviTasks;
  salvaStato();
  render();
}

// Evita che il testo inserito dall'utente venga interpretato come HTML.
function escapeHTML(testo) {
  return String(testo).replace(/[&<>"']/g, (carattere) => {
    const caratteri = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    };

    return caratteri[carattere];
  });
}

// Mostra le attività nella pagina e aggiorna il contatore.
function render() {
  if (tasks.length === 0) {
    lista.innerHTML = '<li class="vuoto">Non ci sono attività. Aggiungine una!</li>';
  } else {
    lista.innerHTML = tasks
      .map((task) => `
        <li class="${task.completed ? "fatto" : ""}" data-id="${task.id}">
          <span class="titolo">${escapeHTML(task.title)}</span>
          <button class="elimina" type="button" data-id="${task.id}" aria-label="Elimina attività">×</button>
        </li>
      `)
      .join("");
  }

  const completati = tasks.filter((task) => task.completed).length;
  info.textContent = `Totali: ${tasks.length} · Completati: ${completati}`;
}

// Aggiunge una nuova attività.
function addTask(title) {
  const pulito = title.trim();

  if (pulito === "") {
    return;
  }

  const nuovaTask = {
    id: Date.now(),
    title: pulito,
    completed: false
  };

  aggiornaStato([...tasks, nuovaTask]);
}

// Cambia lo stato di un'attività: completata o da fare.
function toggleTask(id) {
  const nuoviTasks = tasks.map((task) =>
    task.id === id
      ? { ...task, completed: !task.completed }
      : task
  );

  aggiornaStato(nuoviTasks);
}

// Elimina un'attività.
function deleteTask(id) {
  const nuoviTasks = tasks.filter((task) => task.id !== id);
  aggiornaStato(nuoviTasks);
}

// Gestisce l'invio del modulo.
form.addEventListener("submit", (evento) => {
  evento.preventDefault();

  addTask(campo.value);

  campo.value = "";
  campo.focus();
});

// Gestisce i clic sulla lista usando la delegazione degli eventi.
lista.addEventListener("click", (evento) => {
  const elemento = evento.target;

  if (elemento.classList.contains("elimina")) {
    deleteTask(Number(elemento.dataset.id));
    return;
  }

  const riga = elemento.closest("li[data-id]");

  if (riga) {
    toggleTask(Number(riga.dataset.id));
  }
});

// Visualizza subito le attività salvate.
render();
