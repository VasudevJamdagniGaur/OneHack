# Prithvi-EO-2.0 300M · Sen1Floods11

Readable outline of `Prithvi-EO-V2-300M-TL-Sen1Floods11.pt`.

The `.pt` file is a binary PyTorch checkpoint, about 1.22 GB on disk. Opening it in an editor will not show layers, comments, or Python. This note is the readable view. Do not edit the `.pt` file, do not pretty-print it into text, and do not rewrite it as a source file. The snippets below are reading notes only. They are not wired into SobekAI, they are not run by this document, and they do not load, save, train, or alter the checkpoint.

## What this file is, and what it is not

IBM and NASA published Prithvi-EO-2.0-300M-TL as a temporal Earth-observation backbone. The copy in this folder is that backbone after a flood-mapping fine-tune on Sen1Floods11. The fine-tune turns a general satellite encoder into a segmenter that marks flood water on a six-band Sentinel-2 chip. It is a detector of water that is already visible in an image. It is not a forecast, not a river-gauge model, and not an official warning.

SobekAI keeps that distinction on purpose. The early-warning score is a separate expert-weighted layer. This checkpoint is only the flood-extent detector. A high risk score elsewhere in the product is not a claim that this network has already drawn a flood polygon. A flood polygon from this network is not a claim that a future flood was predicted. Those two jobs stay separate so a demo cannot quietly swap one for the other.

Facts stored in the file, not inferred from the name alone:

- Model id used by this app: `ibm-nasa-geospatial/Prithvi-EO-2.0-300M-TL-Sen1Floods11`
- Card: https://huggingface.co/ibm-nasa-geospatial/Prithvi-EO-2.0-300M-TL-Sen1Floods11
- Task class: `terratorch.tasks.SemanticSegmentationTask`
- Saved with PyTorch Lightning 2.4.0
- Snapshot: epoch 41, global step 630
- Tensors in `state_dict`: 381
- Parameter count: 319,177,489

The top-level object is a dictionary, not a bare `nn.Module`. Lightning wrote training bookkeeping beside the weights. The keys are `epoch`, `global_step`, `pytorch-lightning_version`, `state_dict`, `loops`, `hparams_name`, and `hyper_parameters`. The weights that matter for reading the architecture live under `state_dict`. The loop state is trainer machinery. It is not a description of flood physics.

A sketch of that container, written so it cannot be executed as a program, looks like this. It names fields. It does not open the file.

```python
# reading note only — not called, does not import, does not touch disk
checkpoint_outline = {
    "epoch": 41,
    "global_step": 630,
    "pytorch-lightning_version": "2.4.0",
    "state_dict": "381 tensors, 319177489 parameters",
    "loops": "trainer loop state, ignore when reading the network",
    "hparams_name": "kwargs",
    "hyper_parameters": "Terratorch SemanticSegmentationTask settings",
}
```

## Why the editor view is unreadable

PyTorch stores tensors as a zip of binary blobs plus a small pickle of names and shapes. A text editor tries to decode those bytes as characters. The result is mojibake, replacement glyphs, and long runs that look like noise. That is normal. It is not a corrupted download, and it is not a file that can be formatted the way YAML or Python can be formatted.

Making the binary "pretty" would mean dumping every weight as a number. That dump would be far larger than 1.22 GB of text, would not help anyone understand the model, and would risk someone treating a text copy as a second set of weights. This note is the substitute. The original `.pt` stays the only weight file.

```text
# not a program
file role: weights
readable substitute: this markdown
action permitted here: none
torch.save: not used
file rewrite: not used
```

## What you give it

The network expects six Sentinel-2 bands, in this order, matching both the checkpoint hyperparameters and the sibling training recipe:

1. Blue
2. Green
3. Red
4. Narrow NIR
5. SWIR 1
6. SWIR 2

Those names are TerraTorch band names, not pixel positions inside a random GeoTIFF. On a typical Sentinel-2 L1C product the matching band indexes used by this app are 1, 2, 3, 8, 11, and 12 when bands are counted from 1. Band 1 in that counting is coastal aerosol, which this model does not consume. Narrow NIR is not the same product as the 10 m NIR band. SWIR 1 and SWIR 2 are the shortwave infrared bands that help separate open water from wet soil, cloud shadow, and built surfaces. Using the wrong six channels would still produce a map. The map would not mean what the fine-tune was trained to mean.

Training cropped chips to 224 by 224. That size is a data choice in the recipe, not a hard limit baked into every convolution. The patch embedding uses a 16 by 16 spatial patch and a temporal patch of 1, so a 224 image becomes a 14 by 14 grid of tokens, 196 patches, plus one class token, which is why the position table has length 197. Inference in this app may use a larger tile and scale the mask back to the source grid. Scaling the output does not invent resolution the sensor did not have.

A comment-only description of one chip, so the shape can be read without building a tensor:

```python
# shape sketch, not allocated
# chip: bands=6, time=1, height=224, width=224
# after patch embed: tokens = 1 + (224/16) * (224/16) = 197
# hidden size per token = 1024
bands = ("BLUE", "GREEN", "RED", "NIR_NARROW", "SWIR_1", "SWIR_2")
```

Reflectance is usually stored as integers in a Sentinel-2 product. The training recipe records `constant_scale: 0.0001`, `no_data_replace: 0.0`, and `no_label_replace: -1`. Those are data-module settings in `config.yaml` beside the checkpoint. They are how the fine-tune expected numbers to be scaled before they reached the network. They are not extra weights inside `state_dict`.

## What it returns

The head is a 1 by 1 convolution from 256 channels to 2 classes. Class names are not stored in the checkpoint. `class_names` in the hyperparameters is empty. This app treats class 1 as flood water and class 0 as not flood water. That mapping is an application convention aligned with `flood_class: 1` in the project config. It is not a label string sitting inside the `.pt` file.

Training loss was cross-entropy. Pixels labeled `-1` are ignored, so a missing or uncertain label does not become a third class and does not get pushed toward "not water" just because the raster used a fill value. Auxiliary heads are absent. Class weights are absent. There is no second loss term stored here that would rebalance rare water pixels after the fact.

The returned object of a real forward pass would be logits, two numbers per pixel, not a probability and not a polygon. A later softmax would turn those logits into a pair of scores that sum to one. This document does not run that step. A softmax sketch that does nothing with real imagery:

```python
# illustration of the output contract, not a forward pass
# logits[..., 0] -> not water
# logits[..., 1] -> flood water, as this app reads class 1
# ignored label during training: -1
# this block has no input and no output
def describe_output():
    return "2-class logits, class names not stored in the checkpoint"
```

A flood mask from this model is a statement about one observation: where the fine-tune thinks water covers usually dry land in that scene. It does not say the water will rise tomorrow. It does not say a road is legally closed. It does not replace a disaster-management authority. SobekAI's own disclaimer belongs on the product screens; it also belongs next to this file so a reader of the weights does not promote the detector into a warning system.

## How the network is stacked

The saved task is an encoder-decoder factory. The encoder is `prithvi_eo_v2_300_tl`. The decoder is `UPerNetDecoder` with 256 channels. Necks sit between them. They select four encoder blocks, reshape tokens back into images, and feed the decoder a pyramid rather than a single token sequence.

```
Sentinel-2 chip (6 bands)
        |
        v
Patch embedding
  6 bands, patch 16x16, hidden size 1024
        |
        v
Prithvi encoder  ·  prithvi_eo_v2_300_tl
  24 transformer blocks
  temporal and location embeddings are present, then unused in this fine-tune
        |
        v
Necks
  keep blocks 5, 11, 17, and 23
  reshape tokens back into an image
        |
        v
UPerNet decoder
  256 channels
  pyramid pooling plus a feature pyramid
        |
        v
Head
  1x1 convolution to 2 classes
```

The "300M" in the file name is the encoder family. The saved file is larger because it also stores the decoder, the necks, and the head. Almost all of the 319 million parameters are still the encoder blocks. The flood-specific pieces are the smaller tail. That is why changing the head would not turn this into a different foundation model, and why replacing the encoder would not be a small edit.

An inert map from prefix to role, again not executed:

```python
# prefix guide, no modules constructed
roles = {
    "model.encoder": "Prithvi backbone, 24 blocks, width 1024",
    "model.neck": "select layers 5, 11, 17, 23 and reshape",
    "model.decoder": "UPerNet, 256 channels",
    "model.head": "2-class 1x1 convolution",
}
```

### Patch embedding

`model.encoder.patch_embed.proj.weight` has shape `(1024, 6, 1, 16, 16)`. Read that tuple from the left. The layer writes 1024 channels. It reads 6 input bands. The temporal kernel is 1, so a single date is a valid input even though the backbone was designed to accept time. The spatial kernel is 16 by 16. One linear projection of a 6 by 16 by 16 cube becomes one token of length 1024. There is a bias beside the weight, which is why this group is two tensors and 1,573,888 parameters.

This is the only place the six band names enter the arithmetic. After this layer, the network no longer knows the words "SWIR" or "blue". It only knows 1024-dimensional tokens. A wrong band order is already baked into those tokens before the first transformer block. That is why the band list is worth repeating.

### Position, class, time, and location

`pos_embed` is `(1, 197, 1024)`: one table, 197 positions, 1024 features. `cls_token` is `(1, 1, 1024)`. The class token is a learned vector concatenated with the patch tokens so the sequence length matches the position table. Semantic segmentation later throws most of that sequence back into a grid. The class token is still in the checkpoint because the backbone was built as a transformer, not because the flood head classifies the whole image as one label.

`temporal_embed_enc.scale` and `location_embed_enc.scale` are each a single float. They are leftovers from the temporal, location-aware pretraining. In this fine-tune they are scales, not full embedding tables, and they are not the part that maps flood water. Leaving them in the file does not mean a time series was passed in at epoch 41. The selected necks do not mention time. The training crops are single chips.

### Encoder blocks

There are 24 blocks, numbered 0 through 23. They account for 288 tensors and 302,309,376 parameters. Twelve tensors per block is the usual split for a pre-norm transformer: two layer-norm scales and biases, the query-key-value projection, the attention output projection, and the two linear layers of the MLP with their biases. The sample tensor recorded from block 0 is `norm1.weight` of length 1024, which matches the hidden size.

Blocks 5, 11, 17, and 23 are the ones the neck keeps. That is every sixth block, ending at the last block. Shallower blocks tend to keep local texture. Deeper blocks tend to mix a wider context. UPerNet wants both, which is why the neck does not keep only block 23. The other twenty blocks still run. Their activations are simply not handed to the decoder. Their weights are still in the file, which is why the encoder dominates the parameter count even though the decoder only sees four depths.

```python
# not a slice of a real module
kept_block_indexes = (5, 11, 17, 23)
hidden_size = 1024
block_count = 24
# encoder parameter mass is in these blocks, not in the 2-class head
```

Final encoder normalization is two vectors of length 1024, weight and bias, grouped here with the class token as 4 tensors and 2,049 parameters. They sit after the last block and before the neck reshapes tokens.

### Necks

Two groups show up in the state dict under `model.neck`. `fpn1` holds 9 tensors and 2,624,257 parameters. `fpn2` holds 2 tensors and 2,097,664 parameters. Together that is 4,721,921 parameters. The hyperparameters name the necks in order: `SelectIndices` with indexes 5, 11, 17, and 23, then `ReshapeTokensToImage`. A learned interpolate-to-pyramid step appears in the sibling `config.yaml` and is the natural home for these feature-pyramid convolutions. The checkpoint hyperparameters list the first two necks explicitly. The tensors themselves include `fpn1` and `fpn2` convolutions, including a sample weight of shape `(1024, 512, 2, 2)`. That is a projection from 512 channels to 1024 with a 2 by 2 kernel, which is a reshape-and-scale step, not the final 2-class head.

The neck is the translation layer. The encoder speaks in tokens. The decoder speaks in feature maps. Nothing in the flood head looks at a length-197 sequence directly.

### UPerNet decoder

The decoder holds 72 tensors and 10,366,988 parameters. The named pieces are:

- `psp_modules`: pyramid pooling, 24 tensors. A sample convolution is `(256, 1024, 1, 1)`, a pointwise map from 1024 encoder channels down to 256.
- `bottleneck`: one 3 by 3 convolution of shape `(256, 2048, 3, 3)` plus a norm of length 256. The 2048 input channels are concatenated pooled context, not a second backbone.
- `lateral_convs`: 18 tensors, 1 by 1 projections that pull each selected feature map to 256 channels. A sample weight is `(256, 256, 1, 1)`.
- `fpn_convs`: 18 tensors, 3 by 3 fusions after laterals are added. A sample weight is `(256, 256, 3, 3)`.
- `fpn_bottleneck`: one 3 by 3 convolution `(256, 1024, 3, 3)` plus a norm. Four 256-channel maps concatenated make 1024 channels, then this layer squeezes them back to 256.

UPerNet's idea, stated without running it, is to pool the deepest map at several spatial bins, project those bins, upsample them, and merge that context with lateral maps from earlier depths. The flood label then has both a wide water body and a sharper boundary. That is a decoder design. It is not a claim about accuracy on any particular Indian flood.

### Head

`model.head.head.2.weight` is `(2, 256, 1, 1)`, 514 parameters including bias. Dropout of 0.1 is a hyperparameter, not a tensor. Dropout has no weights to store. At inference it is turned off, so the stored head is the whole classifier.

```python
# head contract, no layer built
in_channels = 256
out_classes = 2
kernel = (1, 1)
dropout_rate_not_a_weight = 0.1
```

## Where the parameters sit

| Part | Tensors | Parameters | What it does |
| --- | ---: | ---: | --- |
| Encoder blocks 0–23 | 288 | 302,309,376 | The vision transformer |
| Patch embedding | 2 | 1,573,888 | Splits the 6-band image into patches |
| Position embedding | 1 | 201,728 | 197 tokens by 1024 |
| Decoder | 72 | 10,366,988 | UPerNet flood-map decoder |
| Necks | 11 | 4,721,921 | Turns selected blocks into an image pyramid |
| Encoder norm + cls token | 4 | 2,049 | Final encoder normalization |
| Classification head | 2 | 514 | 256 channels to 2 classes |
| Temporal / location scales | 2 | 2 | Scales kept from pretraining |

Those counts add to 381 tensors and 319,177,489 parameters. That is the full `state_dict`, not a subset. About 94.7 percent of the parameters are the 24 encoder blocks. The entire flood head is 514 numbers. Reading the file as "a small flood model wrapped around a large satellite encoder" matches the arithmetic.

```python
# arithmetic check written out, not executed
groups = {
    "encoder_blocks": 302_309_376,
    "patch_embed": 1_573_888,
    "pos_embed": 201_728,
    "decoder": 10_366_988,
    "necks": 4_721_921,
    "encoder_norm_and_cls": 2_049,
    "head": 514,
    "time_and_location_scales": 2,
}
# sum(groups.values()) == 319_177_489
# sum of tensor counts == 381
```

Float32 storage of 319,177,489 parameters is about 1.19 GB of raw weights before zip compression and before Lightning's extra keys. The file on disk is about 1.22 GB. The gap is the zip container, pickle metadata, optimizer-free trainer state, and the hyperparameter blob. There is no second copy of the encoder hiding in that gap.

## Training settings stored with the weights

These come from `hyper_parameters` inside the checkpoint:

- Class path: `terratorch.tasks.SemanticSegmentationTask`
- Instantiator: `lightning.pytorch.cli.instantiate_module`
- Backbone: `prithvi_eo_v2_300_tl`
- Backbone pretrained flag: true, meaning the fine-tune started from the published encoder rather than from random weights
- Decoder: `UPerNetDecoder`, 256 channels, scale modules enabled
- Necks recorded on the task: `SelectIndices` then `ReshapeTokensToImage`
- Head dropout: 0.1
- Number of classes: 2
- Rescale: true
- Loss: `ce`
- Ignore index: -1
- Learning rate stored on the task: 0.001
- Freeze backbone: false
- Freeze decoder: false
- Plot on validation: 10
- Auxiliary heads, auxiliary loss, class weights, optimizer, scheduler, tiled inference parameters, and test dataloader names: not set on the task object

"Not frozen" means both the 302 million encoder parameters and the decoder were eligible for updates during the fine-tune. It does not mean every parameter moved by a large amount. It does mean this file is not a frozen backbone with a freshly attached linear probe. The encoder weights here are the fine-tuned ones, not a pristine copy of the foundation checkpoint.

The sibling `config.yaml` is the Lightning recipe that produced this style of run. It is not a second weight file. It records AdamW with learning rate `5.0e-05`, betas 0.9 and 0.999, and weight decay 0.05, plus a cosine schedule with `T_max` 50. The task object inside the checkpoint still stores `lr: 0.001`. Those two numbers are not a contradiction to hide. One is the optimizer block in the recipe file. One is the learning-rate field saved on the task. Neither number is an accuracy. Neither should be quoted as a learning-rate that this note measured.

Other recipe facts, from that YAML rather than from tensor shapes:

- Trainer precision in the recipe: 16-mixed
- Max epochs in the recipe: 50
- This snapshot: epoch 41, so the 50-epoch budget was not exhausted in the saved file
- Early stopping in the recipe watched `val/loss` with patience 20
- Check validation every 2 epochs
- Batch size 16, 8 workers, drop last
- Crops 224 with horizontal and vertical flips at probability 0.5
- `use_metadata: false`

No validation loss, IoU, precision, recall, or F1 is stored in the keys inspected here. This note does not invent them. Sen1Floods11 is the dataset named by the model card and by `terratorch.datamodules.Sen1Floods11NonGeoDataModule` in the recipe. It is a labeled optical flood dataset used to teach water versus not-water. It is not a catalog of Assam, Bihar, or Delhi scenes sitting inside the `.pt` file. Nothing in the state dict is a place name.

```python
# fields this note refuses to invent
not_in_checkpoint = (
    "iou",
    "precision",
    "recall",
    "f1",
    "place_name",
    "official_warning_text",
)
```

## How a forward pass would be described, without running one

A reader who wants the sequence in code form can read the following as a caption. It constructs nothing, moves nothing to a device, and has no image argument that could be filled in by accident.

```python
# caption of a forward pass
# 1. take six aligned bands, scaled the way the data module expected
# 2. patch-embed to tokens of size 1024
# 3. add position information, length 197 for a 224 input
# 4. run 24 transformer blocks
# 5. keep outputs of blocks 5, 11, 17, 23
# 6. reshape those tokens into feature maps
# 7. UPerNet merges them at 256 channels
# 8. 1x1 head writes 2 logits per pixel
# 9. stop
# no weights are updated in a caption
def forward_caption():
    return None
```

`forward_caption` returning `None` is the point. A real call would need TerraTorch, the checkpoint path, a device, and a scene. Those steps live in the application code already. Duplicating them here would make this note a second runner. This note stays a reader.

## How this app points at the file

The repository `config.yaml` records:

- `prithvi.enabled`: true
- `prithvi.model_id`: `ibm-nasa-geospatial/Prithvi-EO-2.0-300M-TL-Sen1Floods11`
- `prithvi.backbone`: `prithvi_eo_v2_300_tl`
- `prithvi.role`: `event_flood_extent`
- `prithvi.weights_dir`: `models/prithvi`
- `prithvi.checkpoint`: `Prithvi-EO-V2-300M-TL-Sen1Floods11.pt`
- `prithvi.model_config`: `config.yaml`
- `prithvi.num_classes`: 2
- `prithvi.flood_class`: 1
- `prithvi.tile_size`: 512
- `prithvi.scene`: not set in that file

The role string `event_flood_extent` is the product's way of saying "map water on a scene from a historical event." It is not a flag inside the checkpoint. The checkpoint would be the same object if it were copied into another project.

The intended command, already documented by the project, downloads assets if they are missing and does not by itself invent a scene:

```bash
python scripts/run_prithvi_flood.py --download
```

A scene path still has to be set before a real Sentinel-2 image can be mapped. Until then the weights can be present and still unused. Presence of a 1.22 GB file is not evidence that a flood mask was computed.

## What not to do with this file

Do not open the `.pt` and reformat it. Do not commit a text dump of the tensors. Do not `torch.save` a "cleaned" copy over the original. Do not rename tensors so they look friendlier. A loader matches names like `model.encoder.blocks.0.norm1.weight`. A friendlier name is a broken key.

Do not treat epoch 41 as a quality score. Early stopping can halt before `max_epochs`. A later epoch is not automatically a better flood map. The file does not include the metric that would decide that.

Do not describe the model as trained on the events shown in the SobekAI simulator unless a scene from that event was actually passed through this network and the result was saved. The fine-tune data named in the recipe is Sen1Floods11. Local scenario images in the app are visual references unless a separate run says otherwise.

Do not add official warning text, helpline numbers, or district orders to this file. The network outputs class logits. Authorities issue instructions. Those are different objects.

```python
# prohibited operations, listed so they stay unused
# torch.save(...)
# Path("...pt").write_bytes(...)
# state_dict[new_name] = state_dict.pop(old_name)
# optimizer.step()
pass
```

## A short glossary

Backbone. The encoder family name `prithvi_eo_v2_300_tl`. "tl" in the published name refers to the temporal and location pretraining of Prithvi-EO-2.0, not to a file extension.

Checkpoint. The `.pt` dictionary written by Lightning. Weights plus bookkeeping.

Decoder. UPerNet, the part that turns multi-depth feature maps into a spatial classification.

Encoder. The 24 transformer blocks plus patch embedding.

Head. The last 1 by 1 convolution, 2 classes.

Ignore index. Label value `-1`, skipped by the loss, not predicted as its own class.

Logit. The raw class score before a softmax. The head emits logits.

Neck. The adapter that selects four block outputs and reshapes tokens into maps.

Parameter. One stored number the optimizer was allowed to change. 319,177,489 of them are in this file.

State dict. The 381 named tensors. This is the part to read if you want shapes. It is not the part to read if you want a sentence about a village.

Tensor. A named array with a shape and a dtype. The weights inspected here are `torch.float32`.

Tile. A spatial window used at inference, 512 in the app config, not necessarily 224. The network sees one window at a time. The windows are stitched by the application, not by a tensor named "tile" inside the checkpoint.

## Bottom line

Read this note, not the binary. The file is a Lightning checkpoint of a TerraTorch semantic segmenter: Prithvi-EO-2.0-300M-TL plus UPerNet, six Sentinel-2 bands, two classes, 381 tensors, 319,177,489 parameters, saved at epoch 41. The encoder is almost the entire file. The flood head is a 1 by 1 layer. Nothing in the snippets above loads that file, saves that file, or changes a weight.
