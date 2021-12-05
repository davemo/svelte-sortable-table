<script>
  import { onMount } from 'svelte'
  import { writable } from 'svelte/store'
  import { downloadCSV } from '$lib/download-csv.js'

  let rushingData = writable([])

  onMount(async () => {
    fetch("/rushing.json")
      .then(res => res.json())
      .then(data => rushingData.set(data))
      .catch(e => [])
  })

  function doExportOf(data) {
    return function(e) {
      downloadCSV(data, document.querySelector('#exportAnchor'))
    }
  }

  function descendingByField(field) {
    return function compare(a, b) {
      let intA = parseFloat(a[field])
      let intB = parseFloat(b[field])
      if(intA > intB) return -1;
      if(intA < intB) return 1;
      return 0;
    }
  }

  function sort(node, field) {
    const setSortField = function(e) {
      sortField = field
      document
        .querySelectorAll(".sorted")
        .forEach(n => n.classList.remove("sorted"))
      node.classList.add("sorted")
    }

    node.classList.add("sortable")
    node.addEventListener("click", setSortField, true);

    return {
      destroy() {
        node.removeEventListener("click", setSortField, true);
      }
    }
  }

  let sortField = ""
  let query = ""

  function resetSortField() {
    sortField = ""
    document.querySelectorAll(".sortable").forEach(n => n.classList.remove("sorted"))
  }

  function resetQuery() {
    query = ""
  }

  function normalizedPlayerNameFor(userQuery) {
    return function(data) {
      return data.Player.toLowerCase().indexOf(userQuery.toLowerCase()) !== -1
    }
  }

  $: filteredSortedData =
    [...$rushingData]
      .filter(normalizedPlayerNameFor(query))
      .sort(descendingByField(sortField))
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

  :global(.sortable):hover {
    cursor: pointer;
    color: red;
  }

  :global(.sortable) {
    background: url('/img/sort_both.png') no-repeat;
    background-position: right;
    padding-right: 20px;
  }

  :global(.sortable.sorted) {
    background: url('/img/sort_desc.png') no-repeat;
    background-position: right;
    padding-right: 20px;
  }

  header {
    margin-bottom: 20px;
  }
</style>

<h1>
  NFL Rushing Statistics
</h1>

<header>
  <div>
    Filter: <input bind:value={query} placeholder="Enter player name...">
    {#if query}
      <button on:click={resetQuery}>Clear Filter</button>
    {/if}

    <button on:click={doExportOf(filteredSortedData)}>Export to CSV</button>

    {#if sortField}
      <button on:click={resetSortField}>Clear Sort</button>
    {/if}
  </div>
</header>

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
      <th use:sort={"Yds/G"}>Yds/G</th>
      <th use:sort={"TD"}>TD</th>
      <th use:sort={"Lng"}>Lng</th>
      <th>1st</th>
      <th>1st%</th>
      <th>20+</th>
      <th>40+</th>
      <th>Fum</th>
    </tr>
  </thead>
  <tbody>
    {#each filteredSortedData as data (data.Player)}
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

<a id="exportAnchor" style="display: none"></a>