<script>
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import { downloadCSV } from '$lib/download-csv.js';

  /*
    Svelte stores provide subscription behaviour
    to allow templates to automatically re-render.

    - https://svelte.dev/docs#svelte_store
  */
  let rushingData = writable([]);

  /*
    Runs once the component is mounted in the DOM.

    Similar to React's componentDidMount and/or
    immediate async hook invocation.

    - https://svelte.dev/docs#onMount
  */
  onMount(async () => {
    fetch('/rushing.json')
      .then((res) => res.json())
      .then((data) => rushingData.set(data))
      .catch((e) => []);
  });

  /*
    UI event handler to trigger the export
    from lib/download-csv.js
  */
  function doExportOf(data) {
    return function (e) {
      downloadCSV(data, document.querySelector('#exportAnchor'));
    };
  }

  /*
    A curried function bound to sort descending by
    the specified field.
  */
  function descendingByField(field) {
    return function compare(a, b) {
      let intA = parseFloat(a[field]);
      let intB = parseFloat(b[field]);
      if (intA > intB) return -1;
      if (intA < intB) return 1;
      return 0;
    };
  }

  /*
    A svelte action, which is a type of element directive.

    Responsible for attaching event handlers, modifying DOM elements,
    and providing a destroy method to unbind and cleanup.

    This is very similar to the AngularJS concept of a directive and
    allows developers to create custom DSLs using HTML attributes.

    ie: <th use:sort={field}>

    - https://svelte.dev/docs#use_action
  */
  function sort(node, field) {
    const setSortField = function (e) {
      sortField = field;
      document.querySelectorAll('.sorted').forEach((n) => n.classList.remove('sorted'));
      node.classList.add('sorted');
    };

    node.classList.add('sortable');
    node.addEventListener('click', setSortField, true);

    return {
      destroy() {
        node.removeEventListener('click', setSortField, true);
      }
    };
  }

  // The value to sort by.
  let sortField = '';

  // The value to filter by.
  let query = '';

  // Resets the data and UI state for sorting.
  function resetSortField() {
    sortField = '';
    document.querySelectorAll('.sortable').forEach((n) => n.classList.remove('sorted'));
  }

  // Resets the data state for filtering.
  function resetQuery() {
    query = '';
  }

  /*
    The Player Name data in rushing.json is not normalized.
    This accounts for users typing queries that might
    not match the casing stored in the file.
  */
  function normalizedPlayerNameFor(userQuery) {
    return function (data) {
      return data.Player.toLowerCase().indexOf(userQuery.toLowerCase()) !== -1;
    };
  }

  /*
    A reactive statement.

    Svelte uses this valid JavaScript syntax (the label* construct)
    within its compiler to setup and track dependencies and changes
    for the expression listed.

    Conceptually, any time our query or sortField change, Svelte
    will re-evaluate this expression to keep it up to date.

    The UI can then bind to filteredSortedData below and be guaranteed
    to be kept up to date as things change.

    - https://svelte.dev/docs#3_$_marks_a_statement_as_reactive
    * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/label
  */
  $: filteredSortedData =
    [...$rushingData]
      .filter(normalizedPlayerNameFor(query))
      .sort(descendingByField(sortField));
</script>

<h1>NFL Rushing Statistics</h1>

<header>
  <div>
    Filter: <input bind:value={query} placeholder="Enter player name..." />
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
      <th use:sort={'Yds/G'}>Yds/G</th>
      <th use:sort={'TD'}>TD</th>
      <th use:sort={'Lng'}>Lng</th>
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
        <td>{data['Player']}</td>
        <td>{data['Team']}</td>
        <td>{data['Pos']}</td>
        <td>{data['Att']}</td>
        <td>{data['Att/G']}</td>
        <td>{data['Yds']}</td>
        <td>{data['Avg']}</td>
        <td>{data['Yds/G']}</td>
        <td>{data['TD']}</td>
        <td>{data['Lng']}</td>
        <td>{data['1st']}</td>
        <td>{data['1st%']}</td>
        <td>{data['20+']}</td>
        <td>{data['40+']}</td>
        <td>{data['FUM']}</td>
      </tr>
    {/each}
  </tbody>
</table>

<a id="exportAnchor" style="display: none" />

<style>
  /*
    Svelte scopes styles to any given component automatically
    to avoid bleed and insulate from the cascade.

    This gives svelte components much better encapsulation and
    they become more resilient to styling changes.

    - https://svelte.dev/docs#style
  */
  table {
    margin-bottom: 2em;
    width: 100%;
    border-collapse: collapse;
  }

  th {
    border-bottom: 2px solid #ccc;
    font-weight: bold;
    text-align: center;
    border-right: 1px solid #ccc;
  }

  td {
    border-bottom: 1px solid #ddd;
  }

  th,
  td {
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
