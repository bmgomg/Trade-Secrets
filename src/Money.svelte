<script>
	import NumberFlow from '@number-flow/svelte';
	const { value, cents, trend = 1, suffix } = $props();
</script>

<NumberFlow
	{value}
	{trend}
	{suffix}
	format={{
		style: 'currency',
		currency: 'USD',
		minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
		maximumFractionDigits: cents ? 2 : 0
	}}
/>

<style>
</style>
