(function () {
  document.addEventListener('mousemove', event => {
    if (Math.random() <= 0.4) return;
    const spark = document.createElement('span');
    spark.className = 'chispa-magica';
    spark.style.left = `${event.clientX}px`;
    spark.style.top = `${event.clientY}px`;
    spark.style.setProperty('--tx', `${(Math.random() - 0.5) * 60}px`);
    spark.style.setProperty('--ty', `${Math.random() * 60 + 20}px`);
    document.body.appendChild(spark);
    setTimeout(() => spark.remove(), 800);
  });

  document.addEventListener('click', event => {
    const explosion = document.createElement('div');
    explosion.className = 'explosion-click';
    explosion.style.left = `${event.clientX}px`;
    explosion.style.top = `${event.clientY}px`;
    document.body.appendChild(explosion);
    setTimeout(() => explosion.remove(), 800);
  });
})();
