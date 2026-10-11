<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Dialog from '$lib/components/ui/dialog/index';
	import { getCroppedFile } from '$stores/utlis/crop-image';
	import { ImageUp, Minus, Plus } from '@lucide/svelte';
	import Cropper, { type CropArea, type OnCropCompleteEvent } from 'svelte-easy-crop';
	import { toast } from 'svelte-sonner';

	let {
		open = $bindable(false),
		initialFile = $bindable<File | null>(null),
		previewUrl = $bindable<string | null>(null),
		onSave,
		onClose
	}: {
		open: boolean;
		initialFile: File | null;
		previewUrl: string | null;
		onSave: (file: File) => void;
		onClose: () => void;
	} = $props();

	const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];
	const MAX_SIZE_MB = 10;
	let fileInput: HTMLInputElement;

	let crop = $state({ x: 0, y: 0 });
	let zoom = $state(1);
	let croppedPixels = $state<CropArea | null>(null);
	let file = $state<File | null>(null);

	$effect(() => {
		if (!open) return;
		file = initialFile;
	});

	function onCropComplete(event: OnCropCompleteEvent) {
		croppedPixels = event.pixels;
	}

	function onFileChange(e: Event) {
		const input = e.currentTarget as HTMLInputElement;
		const selected = input.files?.[0];
		if (!selected) return;

		if (!ACCEPTED_TYPES.includes(selected.type)) {
			toast.error('Only JPG, JPEG and PNG files are allowed');
			return;
		}
		if (selected.size > MAX_SIZE_MB * 1024 * 1024) {
			toast.error(`File must be under ${MAX_SIZE_MB}MB`);
			return;
		}

		file = selected;
		if (previewUrl) URL.revokeObjectURL(previewUrl);
		previewUrl = URL.createObjectURL(selected);

		zoom = 1;
		crop = { x: 0, y: 0 };
		croppedPixels = null;
	}

	async function save() {
		if (!file || !croppedPixels) return;
		const croppedFile = await getCroppedFile(file, croppedPixels);
		onSave(croppedFile);
		close();
	}

	function close() {
		open = false;
		file = null;
		zoom = 1;
		crop = { x: 0, y: 0 };
		croppedPixels = null;
	}

	function onCloseRevokeUrl() {
		open = false;
		file = null;
		zoom = 1;
		crop = { x: 0, y: 0 };
		croppedPixels = null;
		if (previewUrl) URL.revokeObjectURL(previewUrl);
		previewUrl = null;
		onClose();
	}
</script>

<Dialog.Root
	bind:open
	onOpenChange={(v) => {
		if (!v) onCloseRevokeUrl();
	}}
>
	<Dialog.Content class="gap-0 p-0 sm:max-w-lg">
		<Dialog.Header class="px-6 pt-6 pb-4">
			<Dialog.Title>Change profile photo</Dialog.Title>
			<Dialog.Description class="text-xs">
				200 × 200 px recommended · JPG, JPEG and PNG · Up to 10MB · Drag to reposition · Scroll to
				zoom
			</Dialog.Description>
		</Dialog.Header>

		<!-- Cropper area -->
		<div class="relative mx-6 mb-4 overflow-hidden rounded-lg bg-black" style="height: 300px;">
			{#if previewUrl}
				{#key previewUrl}
					<Cropper
						image={previewUrl}
						bind:crop
						bind:zoom
						aspect={1}
						cropShape="round"
						showGrid={false}
						minZoom={1}
						maxZoom={5}
						oncropcomplete={onCropComplete}
					/>
				{/key}
			{:else}
				<div class="flex h-full items-center justify-center text-xs text-muted-foreground">
					No image selected
				</div>
			{/if}
		</div>

		<!-- Zoom controls -->
		<div class="mx-6 mb-5 flex items-center gap-3">
			<button
				type="button"
				onclick={() => (zoom = Math.max(0.5, +(zoom - 0.1).toFixed(1)))}
				class="text-muted-foreground transition-colors hover:text-foreground"
				aria-label="Zoom out"
			>
				<Minus size={16} />
			</button>

			<input
				type="range"
				min="0.5"
				max="5"
				step="0.1"
				bind:value={zoom}
				class="h-1.5 flex-1 cursor-pointer accent-foreground"
			/>

			<button
				type="button"
				onclick={() => (zoom = Math.min(5, +(zoom + 0.1).toFixed(1)))}
				class="text-muted-foreground transition-colors hover:text-foreground"
				aria-label="Zoom in"
			>
				<Plus size={16} />
			</button>

			<Button
				variant="outline"
				size="sm"
				class="ml-2 gap-1.5 text-xs"
				onclick={() => fileInput.click()}
			>
				<ImageUp size={14} />
				Upload new
			</Button>

			<input
				bind:this={fileInput}
				type="file"
				accept=".jpg,.jpeg,.png"
				class="hidden"
				onchange={onFileChange}
			/>
		</div>

		<Dialog.Footer class="border-t px-6 py-4">
			<Button variant="outline" onclick={close}>Cancel</Button>
			<Button
				class="opacity-80 hover:opacity-100"
				onclick={save}
				disabled={!file || !croppedPixels}
			>
				Apply
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
