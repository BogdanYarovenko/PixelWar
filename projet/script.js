/**
 * Constantes pour les URL des serveurs et les éléments HTML.
 */
const serveur = "https://pixel-api.codenestedu.fr";
const serveur_tableau = `${serveur}/tableau`;
const serveur_utilisateur = `${serveur}/equipe-utilisateur`;
const serveur_equipe = `${serveur}/choisir-equipe`;
const serveur_modifierPixel = `${serveur}/modifier-case`;
const tbody = document.querySelector("tbody");
const info_serveur = document.getElementById("info_serveur");
const temp_equipe = document.getElementById("temps-equipe");
const buttons = document.querySelectorAll("button");
const tableauAfficher = document.getElementById("tableau");
const temps_attente = document.getElementById("temps-attente");
const eyeOpenButton = document.getElementById("eye-open");
const infoJoueurAfficher = document.getElementById("information");
const uidInput = document.getElementById("name");
uidInput.value = localStorage.getItem("uid");

/**
 * Bascule la visibilité du mot de passe entre texte brut et masqué.
 * @function
 * @returns {void}
 * @example
 * togglePasswordVisibility();
 */
const togglePasswordVisibility = () => {
  if (uidInput.type === "text") {
    uidInput.type = "password";
    eyeOpenButton.src = "images/eye-closed.png";
  } else {
    uidInput.type = "text";
    eyeOpenButton.src = "images/eye-open.png";
  }
};
eyeOpenButton.addEventListener("click", togglePasswordVisibility);


/**
 * Définit la valeur de l'UID sélectionné dans le stockage local.
 * @function
 * @param {string} value - La valeur de l'UID à définir.
 * @returns {void}
 * @example
 * setSelectedUID("exampleUID");
 */
const setSelectedUID = (value) => {
  localStorage.setItem("selectedUID", value);
}

/**
 * Valide l'UID saisi avant de modifier un pixel.
 * @function
 * @returns {boolean} - true si l'UID est valide, sinon false.
 * @example
 * valideUID();
 */
const valideUID = () => {
  let uid = document.getElementById("name").value.trim();

  if (uid === "") {
    alert("Veuillez saisir un UID pour modifier un pixel.");
    return false;
  }
  if (uid.length != 8) {
    alert("Votre UID n'est pas connu pour le serveur.");
    return false;
  }
  setSelectedUID(uid);

  return true;
};

/**
 * Définit la valeur de l'équipe sélectionnée dans le stockage local.
 * @function
 * @param {string} value - La valeur de l'équipe à définir.
 * @returns {void}
 * @example
 * setSelectedTeam("teamA");
 */
const setSelectedTeam = (value) => {
  localStorage.setItem("selectedTeam", value);
};

/**
 * Modifie la couleur des boutons en fonction de l'équipe sélectionnée.
 * @function
 * @returns {void}
 * @example
 * setButtonColor();
 */
const setButtonColor = () => {
  const selectedTeam = localStorage.getItem("selectedTeam");
  if (selectedTeam) {
    buttons.forEach((button) => {
      if (button.value === selectedTeam) {
        button.style.backgroundColor = "green";
      } else {
        button.style.backgroundColor = "";
      }
    });
  }
};
window.addEventListener("load", setButtonColor);

/**
 * Configure les écouteurs d'événements pour chaque bouton.
 * @function
 * @returns {void}
 * @example
 * setupButtonListeners();
 */
const setupButtonListeners = () => {
  buttons.forEach((button) => {
    button.addEventListener("click", function () {
      choisirTeam(button.value);
      setSelectedTeam(button.value);
      if (valideUID()) {
        button.style.backgroundColor = "green";
      }
      buttons.forEach((btn) => {
        if (btn !== button) {
          btn.style.backgroundColor = "";
        }
      });
    });
  });
};

/**
 * Insère le tableau récupéré depuis le serveur dans le document HTML.
 * @function
 * @returns {void}
 * @example
 * insertTab();
 */

const insertTab = () => {
  fetch(serveur_tableau)
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        response.json().then((error) => {
          info_serveur.textContent = error.msg;
          info_serveur.style.color = "red";
        });
      }
    })

    .then((tableau) => {
      for (let i = 0; i < tableau.length; i++) {
        let row = document.createElement("tr");
        for (let j = 0; j < tableau[i].length; j++) {
          let colomns = document.createElement("td");
          colomns.style.backgroundColor = tableau[i][j];
          colomns.addEventListener("click", function () {
            modifierPixel(i, j);
          });
          row.appendChild(colomns);
        }
        tableauAfficher.appendChild(row);
      }
    })
    .then((data) => {
      if (data && data.msg) {
        info_serveur.textContent = data.msg;
        info_serveur.style.color = "green";
      }
    })
    .catch((error) => {
      console.error(error.msg);
    });
};

/**
 * Choisi une équipe pour le joueur et effectue les actions associées, telles que la mise à jour du tableau et des informations du joueur.
 * @function
 * @param {string} value - La valeur de l'équipe choisie.
 * @returns {void}
 * @example
 * choisirTeam("teamA");
 */
const choisirTeam = (value) => {
  fetch(serveur_equipe, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      uid: document.getElementById("name").value,
      nouvelleEquipe: value,
    }),
  })
    .then((response) => {
      if (response.ok) {
        startTimer10();
        disableButtons();
        updateTableau();
        updateInfoJoueur();
        startResetTimer();
        return response.json();
      } else {
        response.json().then((error) => {
          info_serveur.textContent = error.msg;
          info_serveur.style.color = "red";
        });
      }
    })
    .then((data) => {
      if (data && data.msg) {
        info_serveur.textContent = data.msg;
        info_serveur.style.color = "green";
      }
    })
    .catch((error) => {
      console.error(error.msg);
    });
};


/**
 * Modifie un pixel dans le tableau en fonction des paramètres spécifiés.
 * @function
 * @param {number} row - L'indice de la ligne du pixel à modifier.
 * @param {number} col - L'indice de la colonne du pixel à modifier.
 * @returns {void}
 * @example
 * modifierPixel(2, 5);
 */
const modifierPixel = (row, col) => {
  fetch(serveur_modifierPixel, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      color: document.getElementById("color").value,
      uid: document.getElementById("name").value,
      col: col,
      row: row,
    }),
  })
    .then((response) => {
      if (response.ok) {
        updateTableau();
        updateInfoJoueur();
        startTimer15(); // Permet de commencer le timer de 15 secondes.
        startResetTimer(); // Timer pour réinitialiser les couleurs des boutons après 30 secondes.
        return response.json();
      } else {
        response.json().then((error) => {
          info_serveur.textContent = error.msg;
          info_serveur.style.color = "red";
        });
      }
    })
    .then((data) => {
      if (data && data.msg) {
        info_serveur.textContent = data.msg;
        info_serveur.style.color = "green";
      }
    })
    .catch((error) => {
      console.error(error.msg);
    });
};

/**
 * Affiche les informations du joueur en fonction de son UID.
 * @function
 * @returns {void}
 * @example
 * info_joueur();
 */
const info_joueur = () => {
  let uidJoueur = document.getElementById("name").value;
  const serveur_info = `${serveur}/liste-joueurs?uid=${uidJoueur}`;
  fetch(serveur_info)
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        response.json().then((error) => {
          info_serveur.textContent = error.msg;
          info_serveur.style.color = "red";
        });
      }
    })
    .then((info) => {
      if (info) {
        info.sort(
          (a, b) =>
            new Date(b.lastModificationPixel) -
            new Date(a.lastModificationPixel)
        ); // Trier les informations par date de modification
        let lastTenModified = info.slice(0, 10); // Récupérer les 10 dernières modifications
        tbody.innerHTML = ""; // Vider le tableau
        lastTenModified.forEach((player) => {
          let row = document.createElement("tr");
          let nom = document.createElement("td");
          nom.textContent = player.nom;
          row.appendChild(nom);
          let equipe = document.createElement("td");
          equipe.textContent = player.equipe;
          row.appendChild(equipe);
          let lastModificationPixel = document.createElement("td");
          lastModificationPixel.textContent = player.lastModificationPixel;
          row.appendChild(lastModificationPixel);
          let banned = document.createElement("td");
          banned.textContent = player.banned;
          row.appendChild(banned);
          let nbPixelsModifies = document.createElement("td");
          nbPixelsModifies.textContent = player.nbPixelsModifies;
          row.appendChild(nbPixelsModifies);
          tbody.appendChild(row);
        });
      }
    })
    .then((data) => {
      if (data && data.msg) {
        info_serveur.textContent = data.msg;
        info_serveur.style.color = "green";
      }
    })
    .catch((error) => {
      console.log(error);
    });
};

/**
 * Met à jour le tableau d'affichage en le vidant et en insérant un nouveau tableau.
 * @function
 * @returns {void}
 * @example
 * updateTableau();
 */
const updateTableau = () => {
  tableauAfficher.innerHTML = "";
  insertTab();
};

/**
 * Met à jour les informations du joueur en vidant le tableau et en affichant les informations actualisées.
 * @function
 * @returns {void}
 * @example
 * updateInfoJoueur();
 */
const updateInfoJoueur = () => {
  tbody.innerHTML = "";
  info_joueur();
};

/**
 * Désactive tous les boutons pendant 10 secondes.
 * @function
 * @returns {void}
 * @example
 * disableButtons();
 */
const disableButtons = () => {
  buttons.forEach((button) => {
    button.setAttribute("disabled", "true"); // Déactiver le bouton
  });

  setTimeout(enableButtons, 10000); // Activation des boutons après 10 secondes
};

/**
 * Active tous les boutons qui ont été précédemment désactivés.
 * @function
 * @returns {void}
 * @example
 * enableButtons();
 */
const enableButtons = () => {
  buttons.forEach((button) => {
    button.removeAttribute("disabled"); // Activer le bouton
  });
};

/**
 * Démarre un minuteur de 10 secondes.
 * @function
 * @returns {void}
 * @example
 * startTimer10();
 */
const startTimer10 = () => {
  let timeLeft = 10; // 10 secondes
  const countdown = setInterval(() => {
    temp_equipe.textContent = `Vous pouvez changer votre equipe dans ${timeLeft}s `;
    timeLeft--;

    if (timeLeft == 0) {
      clearInterval(countdown);
      temp_equipe.textContent = "Vous pouvez changer votre équipe";
    }
  }, 1000);
};

/**
 * Démarre un minuteur de 15 secondes.
 * @function
 * @returns {void}
 * @example
 * startTimer15();
 */
const startTimer15 = () => {
  let timeLeft = 15; // 15 secondes

  const countdown = setInterval(() => {
    temps_attente.textContent = `Vous pouvez modifier un pixel dans ${timeLeft}s`;
    timeLeft--;

    if (timeLeft == 0) {
      clearInterval(countdown);
      temps_attente.textContent = "Vous pouvez modifier un pixel";
    }
  }, 1000);
};

/**
 * Démarre un minuteur pour réinitialiser les couleurs des boutons après 30 secondes.
 * @function
 * @returns {void}
 * @example
 * startResetTimer();
 */
const startResetTimer = () => {
  setTimeout(resetButtonColors, 30000); // Démarrer le timer pour réinitialiser les couleurs des boutons après 30 secondes
};
/**
 * Réinitialise les couleurs des boutons à leur couleur par défaut et affiche un message d'alerte.
 * @function
 * @returns {void}
 * @example
 * resetButtonColors();
 */
const resetButtonColors = () => {
  alert("Le temps pour modifier un pixel est écoulé. Veuillez choisir une équipe pour continuer.");
  info_serveur.textContent = "Le temps pour modifier un pixel est écoulé. Veuillez choisir une équipe pour continuer";
  info_serveur.style.color = "red";
  buttons.forEach((button) => {
    button.style.backgroundColor = ""; // Réinitialiser la couleur des boutons à leur couleur par défaut
  });

};

/**
 * Appel des fonctions pour afficher le tableau de pixels et les informations de l'utilisateur
 */
setupButtonListeners();
info_joueur();
insertTab();
