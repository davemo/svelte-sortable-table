<script>
  import { onMount } from 'svelte'
  import { writable } from 'svelte/store'

  let rushingData = writable([])

  onMount(async () => {
    fetch("/rushing.json")
      .then(res => res.json())
      .then(data => rushingData.set(data))
      .catch(e => [])
  })
</script>

<style>
  table {
    margin-bottom: 2em;
    width: 100%;
    border-collapse: collapse;
  }

  th {
    border-bottom: 2px solid #ccc;
    font-weight: bold;
    text-align: center;
    border-right:  1px solid #ccc;
  }

  td {
    border-bottom: 1px solid #ddd;
  }

  th, td {
    padding: 4px 10px 4px 10px;
  }
</style>

<h1>
  NFL Rushing Statistics
</h1>

<table>
  <thead>
    <tr>
      <th>Player</th>
      <th>Team</th>
      <th>Position</th>
      <th>Att</th>
      <th>Att/G</th>
      <th>Yds</th>
      <th>Avg</th>
      <th>Yds/G</th>
      <th>TD</th>
      <th>Lng</th>
      <th>1st</th>
      <th>1st%</th>
      <th>20+</th>
      <th>40+</th>
      <th>Fum</th>
    </tr>
  </thead>
  <tbody>
    {#each $rushingData as data (data.Player)}
      <tr>
        <td>{data["Player"]}</td>
        <td>{data["Team"]}</td>
        <td>{data["Pos"]}</td>
        <td>{data["Att"]}</td>
        <td>{data["Att/G"]}</td>
        <td>{data["Yds"]}</td>
        <td>{data["Avg"]}</td>
        <td>{data["Yds/G"]}</td>
        <td>{data["TD"]}</td>
        <td>{data["Lng"]}</td>
        <td>{data["1st"]}</td>
        <td>{data["1st%"]}</td>
        <td>{data["20+"]}</td>
        <td>{data["40+"]}</td>
        <td>{data["FUM"]}</td>
      </tr>
    {/each}
  </tbody>
</table>