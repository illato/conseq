Long-Read Sequencing - Evaluating Integrity of Consensus Sequence Generation from Reads Binned by Unique Molecular Identifiers (UMIs).

----

*Project landing page is `index.html`.*

----

*All code for the project is found in the `js` directory. All code was written in Javascript and relied on d3 for visualizations.*

----

*Data for the visualization is found in the `data` directory.*

----

*The Proposal and Process Book can be found in [repository wiki](https://github.com/illato/conseq/wiki). Originally submitted versions of the Proposal and Process book are in the `docs` folder of the repository.*

----

*The Project Website is found [here](https://illato.github.io/conseq/).*

----

*Our Screencast Presentation Video can be found [here](https://youtu.be/Fq2xSx5wQKo).*

----

*Visualization Content Description:*

<img width="1486" alt="Screen Shot 2022-12-03 at 8 32 30 PM" src="https://user-images.githubusercontent.com/11773171/205473040-c2203c2e-eae7-44b6-bcb4-97eef93f3fa1.png">

1. Bin Number Selection. In a real experiment, we would expect multiple consensus sequences generated from multiple sequence read "bins." We included this selection element to enhance ease of evaluating multiple such bins.
2. Seeing Histograms by Error Type. Checking this box enables the view of smaller histograms representing the frequency of specific error types across the main histogram.
3. The main histogram. This histogram represents the consensus sequence and frequency of errors in binned sequencing reads that were used to create the consensus sequence. Higher error values indicate specific nucleotide sequences that had high error rates, indicating areas that are more likely to reflect an error in the consensus sequence generation. Clicking on a bar filters the error table to selected nucleotide indices.
4. Zooming/Brushing. This miniature histogram reflects the zoom state of the focus histogram above, the within-view context area allows the user to scroll left/right in the focus histogram. Additionally, the user can brush a desired region in the context histogram, causing the focus histogram to zoom to the brushed region.
5. Error table. This table indicates specific errors represented by the bars of the main histogram, specifically where each specific error occured (Nucleotide Index), what error type it was (Error Type), how many sequencing reads had that error (Frequency), and what that error looks like compared to the consensus sequence (Sequence Comparison). The first three columns can be sorted by clicking on their headers.
