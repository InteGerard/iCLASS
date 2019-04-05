import React from 'react';
import Q from 'q';
import * as d3 from './d3';
import {EPS} from './consts';
import MainController from './MainController';


export default class extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			loaded: false,
			meta: {}
		};
	}

	componentDidMount() {
		const params = new URLSearchParams(document.location.search.substring(1));
		const hash = document.location.hash.substring(1);

		const maybe_annotation = params.get('annotation');
		// const maybe_dataset = params.get('dataset');
		const maybe_dataset = params.get('dataset');
		const F_initial = (() => {
			if(maybe_annotation != null || maybe_dataset != null) {
				return (() => {
					const maybe_start = params.get('start');
					const maybe_range = params.get('range');
					if(maybe_annotation != null) {
						return d3.json(`/annotation?id=${maybe_annotation}`); // expect server to also fetch dataset metadata
					}
					else {
						return d3.json(`/dataset_meta?dataset=${maybe_dataset}`).then(d => Object.assign({}, d, {
							dataset: maybe_dataset,
							start: parseFloat(maybe_start) || 0,
							// range: d.point_count / d.Fs - EPS
						}));
						// TODO URGENT make this case work
						// F_meta.then({ point_count, Fs } => D.resolve([maybe_dataset, [0, point_count / Fs]])); // beware of numerical inaccuracy!
					}
				})();
			}
			else {
				return Q.fcall(() => { throw new Exception(); });
			}
		})();
		F_initial.then(meta => {
			if(document.readyState === 'complete') {
				this.setState(state_ => ({
					meta: meta,
					loaded: true
				}));
			}
			else {
				window.addEventListener('load', () => {
					this.setState(state_ => ({
						meta: meta,
						loaded: true
					}));
				});
			}
		}, e => {
			// retry or show dataset selection screen
		})
	}

	render = () =>
		<div>
			{(this.state.loaded) ? <MainController dataset_meta={this.state.meta} patientID={this.props.patientID} /> : <div></div>}
		</div>
}