import sys
import h5py
import string
import numpy as np

RESOLUTION = 1280

def run():
	g = h5py.File(sys.argv[1][:sys.argv[1].rfind('.')] + '.comp.h5', 'w')
	f = h5py.File(sys.argv[1], 'r+')
	try:
		g.create_group('data')
			
		data = np.array(f['data/signal']) ** 2
		nrows = data.shape[1] // RESOLUTION
		resampled = np.reshape(f['data/signal'][:(nrows * RESOLUTION)], data.shape[:-1] + (nrows, RESOLUTION))
		g.create_dataset('data/subsamples', dtype='f', data=[np.mean(resampled, 2), np.std(resampled, 2)])
	except:
		raise Exception()
	finally:
		g.close()
		f.close()
run()