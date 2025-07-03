function generateChecklist() {
  const input = document.getElementById('choreInput').value.trim();
  const list = document.getElementById('choreList');
  list.innerHTML = ''; // clear previous list

  if (!input) {
    alert('Please enter at least one chore.');
    return;
  }

  const chores = input.split('\n').map(item => item.trim()).filter(item => item);

  chores.forEach(chore => {
    const li = document.createElement('li');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';

    checkbox.addEventListener('change', () => {
      li.classList.toggle('completed', checkbox.checked);
    });

    const label = document.createElement('span');
    label.textContent = chore;

    li.appendChild(checkbox);
    li.appendChild(label);
    list.appendChild(li);
  });
}
