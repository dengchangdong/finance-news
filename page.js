fetch('./rss.json')
.then(async function (response) {
  const res = await response.json();
  const items = res.items;

  const list = document.querySelector('.list');
  const fragment = document.createDocumentFragment();

  items.forEach(i => {
    const li = document.createElement('li');
    const p = document.createElement('p');
    const timeObj = new Date(i.date_modified);
    const theHours = (timeObj.getHours()<10?'0':'') + timeObj.getHours();
    const theMinutes = (timeObj.getMinutes()<10?'0':'') + timeObj.getMinutes();
    p.innerHTML = `<span class="pubtime">${theHours}:${theMinutes}</span>${i.title} <a class="link" href="${i.url}" target="_blank">&#10149;</a>`;
    li.appendChild(p);
    fragment.appendChild(li);
  });

  list.appendChild(fragment);
})
