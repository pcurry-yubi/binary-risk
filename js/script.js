document.addEventListener('DOMContentLoaded', function() {
  console.log('Document ready');

  // Add reset functionality
  document.querySelector('button[name="reset"]').addEventListener('click', function() {
    const form = document.getElementById('assessment-form');
    const checkboxes = form.querySelectorAll('input[type="checkbox"]');
    const textbox = document.querySelector('input[type="text"]');
    textbox.value = 'Change Name';
    checkboxes.forEach(checkbox => checkbox.checked = false);
    
    scores.risk = 0;
    scores.likelihood = 0;
    scores.impact = 0;
    
    // Clear URL parameters
    const url = new URL(window.location.href);
    url.searchParams.delete('q');
    url.searchParams.delete('project');
    window.history.replaceState({}, '', url);
    
    renderScores();
  });

  // Add copy link functionality
  document.querySelector('button[name="copyLink"]').addEventListener('click', function() {
    const button = this;
    const originalText = button.textContent;
    
    // Copy current URL to clipboard
    navigator.clipboard.writeText(window.location.href)
      .then(() => {
        // Visual feedback
        button.textContent = 'Copied!';
        setTimeout(() => {
          button.textContent = originalText;
        }, 2000);
      })
      .catch(err => {
        console.error('Failed to copy URL:', err);
        button.textContent = 'Failed to copy';
        setTimeout(() => {
          button.textContent = originalText;
        }, 2000);
      });
  });

  // Function to parse URL parameters
  function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return {
      selections: params.get('q') ? parseInt(params.get('q'), 10) : null,
      project: params.get('project') || ''
    };
  }

  // Function to set URL with current selections
  function updateUrl(binaryString) {
    const url = new URL(window.location.href);
    const projectName = document.querySelector('#project').value.trim();
    
    url.searchParams.set('q', binaryString.toString());
    if (projectName) {
      url.searchParams.set('project', projectName);
    } else {
      url.searchParams.delete('project');
    }
    
    window.history.replaceState({}, '', url);
  }

// Sample data
/*const questions = [
  { id: 1, text: 'The attack can be completed with common skills' },
  { id: 2, text: 'The attack can be completed without significant resources' },
  { id: 3, text: 'The asset is undefended' },
  { id: 4, text: 'There are known weaknesses in the current defences' },
  { id: 5, text: 'The vulnerability is always present in the asset' },
  { id: 6, text: 'The attack can be performed w/o meeting pre-conditions' },
  { id: 7, text: 'There will be consequences from internal sources' },
  { id: 8, text: 'There will be consequences from external sources' },
  { id: 9, text: 'The asset has or creates significant business value' },
  { id: 10, text: 'The repair or replacement costs will be significant' }
];
*/

//modified criteria
const questions = [
  { id: 1, text: 'The change has minimal potential for disruption or impact on systems, services, or users.' },
  { id: 2, text: 'The change is well understood and routine.' },
  { id: 3, text: 'The change has a clear, step-by-step process that has been tested and verified.' },
  { id: 4, text: 'There results of the change are consistent and well known.' },

];

const scores = {
  risk: 0,
  likelihood: 0,
  impact: 0,
  change: 0
};

// Function to render questions
function renderQuestions() {
  const form = document.getElementById('assessment-form');
  questions.forEach(question => {
      const label = document.createElement('label');
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.name = `question-${question.id}`;
      checkbox.addEventListener('change', updateScores);
      label.appendChild(checkbox);
      label.appendChild(document.createTextNode(' ' + question.text));
      form.appendChild(label);
  });
}

// Function to update scores
function updateScores() {
  const form = document.getElementById('assessment-form');
  const checkboxes = form.querySelectorAll('input[type="checkbox"]');
  
  // Convert checkboxes to binary string
  let binaryString = 0;
  checkboxes.forEach((checkbox, index) => {
      if (checkbox.checked) {
          binaryString |= (1 << index);
      }
  });

  // Update URL with current selections
  updateUrl(binaryString);

  // Calculate scores using original algorithm
  scores.likelihood = calculateLikelihood(binaryString);
  scores.impact = calculateImpact(binaryString);
  scores.risk = calculateRisk(scores.likelihood, scores.impact);
  scores.change = calculateChange(binaryString);

  renderScores();
}

function calculateChange(binaryString) {
  return calculateChunkScore(binaryString, 0, 3, 1);
}
function calculateLikelihood(binaryString) {
  return calculateChunkScore(binaryString, 0, 5, 2);
}

function calculateImpact(binaryString) {
  return calculateChunkScore(binaryString, 6, 9, 2);
}

function calculateChunkScore(binaryString, startIndex, stopIndex, blockSize) {
  let scoreAccumulator = 0;
  
  /*for (let i = startIndex; i <= stopIndex; i += blockSize) {
      const blockScore = (binaryString >> i) & 3; // Get 2 bits
      const blockScorePartA = blockScore & 1;
      const blockScorePartB = (blockScore >> 1) & 1;
      const calculatedScore = Math.pow(2, blockScorePartA + blockScorePartB);

      if (scoreAccumulator === 0 || scoreAccumulator === 2) {
          scoreAccumulator = calculatedScore;
      } else if (scoreAccumulator === 1) {
          scoreAccumulator = (calculatedScore === 4 ? 2 : 1);
      } else if (scoreAccumulator === 4) {
          scoreAccumulator = (calculatedScore === 1 ? 2 : 4);
      }
  }
*/

  const checkedBoxes = document.querySelectorAll('input[type="checkbox"]:checked');
  scoreAccumulator = checkedBoxes.length;

  return scoreAccumulator;
}

function calculateRisk(likelihood, impact) {
  const riskSum = likelihood + impact;
  if (riskSum <= 3) return 1;  // Low
  if (riskSum <= 5) return 2;  // Medium
  return 4;  // High
}

// Function to render scores
function renderScores() {
  const scoresDiv = document.getElementById('scores');
  scoresDiv.innerHTML = `
      <!--<p class="score__item">Risk <span class="score score--${getScoreClass(scores.risk)}">${getScoreText(scores.risk)}</span></p>
      <p class="score__item">Likelihood <span class="score score--${getScoreClass(scores.likelihood)}">${getScoreText(scores.likelihood)}</span></p>
      <p class="score__item">Impact <span class="score score--${getScoreClass(scores.impact)}">${getScoreText(scores.impact)}</span></p>-->
	  <p class="score__item">Change type <span class="score score--${getScoreClass(scores.change)}">${getScoreText(scores.change)}</span></p>
  `;
}

// Function to get score text
function getScoreText(score) {
  console.log(score);
  if (score <= 3) return 'Normal';
  if (score == 4) return 'Standard';
  //return 'High';
}

// Function to get score class
function getScoreClass(score) {
  if (score <= 3) return 'high';
  if (score == 4) return 'low';
  //return 'high';
}

// Function to set checkboxes from binary string
function setCheckboxesFromBinary(binaryString) {
  const form = document.getElementById('assessment-form');
  const checkboxes = form.querySelectorAll('input[type="checkbox"]');
  
  checkboxes.forEach((checkbox, index) => {
      checkbox.checked = !!(binaryString & (1 << index));
  });
  
  updateScores();
}

// Add project input change handler
document.querySelector('#project').addEventListener('change', function() {
  updateScores();
});

// Modify initial render to check URL parameters
renderQuestions();
const urlParams = getUrlParams();

if (urlParams.project) {
  document.querySelector('#project').value = urlParams.project;
}

if (urlParams.selections !== null) {
  setCheckboxesFromBinary(urlParams.selections);
} else {
  renderScores();
}

});
